package com.exchkr.club.management.services.Impl;

import com.exchkr.club.management.model.entity.ClubTransaction;
import com.exchkr.club.management.model.entity.MemberDue;
import com.exchkr.club.management.model.entity.Reimbursement;
import com.exchkr.club.management.dao.TransactionRepository;
import com.exchkr.club.management.dao.ClubBudgetRepository;
import com.exchkr.club.management.dao.MemberDuesRepository;
import com.exchkr.club.management.dao.ReimbursementRepository;
import com.exchkr.club.management.services.StripePaymentWebhookService;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.ApiResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Service
public class StripePaymentWebhookServiceImpl implements StripePaymentWebhookService {

    private static final Logger logger = LoggerFactory.getLogger(StripePaymentWebhookServiceImpl.class);

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private MemberDuesRepository duesRepository;
    
    @Autowired
    private ReimbursementRepository reimbursementRepository;
    
    @Autowired
    private ClubBudgetRepository budgetRepository;

    @Override
    @Transactional
    public void processEvent(Event event) {
        try {
            switch (event.getType()) {
                case "payment_intent.succeeded":
                case "payment_intent.payment_failed":
                case "payment_intent.processing":
                    handlePaymentIntent(event);
                    break;
                default:
                    logger.info("ℹ️ Payment event ignored: {}", event.getType());
            }
        } catch (Exception e) {
            logger.error("❌ Error processing Stripe event: {}", event.getType(), e);
            throw e; 
        }
    }

    private void handlePaymentIntent(Event event) {
        PaymentIntent pi = ApiResource.GSON.fromJson(
                event.getDataObjectDeserializer().getRawJson(),
                PaymentIntent.class
        );

        String stripeRefId = pi.getId();
        Optional<ClubTransaction> txOpt = transactionRepository.findByStripeRefId(stripeRefId);

        if (txOpt.isEmpty()) {
            logger.warn("⚠️ Webhook received for unknown Stripe Ref: {}. Skipping.", stripeRefId);
            return;
        }

        ClubTransaction tx = txOpt.get();
        String oldStatus = tx.getStatus();
        String newStatus = mapStripeEventToStatus(event.getType());

        if (newStatus == null) return;

        // 1. Update the Ledger (Transaction table)
        tx.setStatus(newStatus);
        tx.setTransDate(Instant.now());
        transactionRepository.save(tx);

        // 2. Branching Logic: Member Dues vs Reimbursement
        if (tx.getDueId() != null) {
            updateDueRecord(tx.getDueId(), oldStatus, newStatus, tx.getAmount());
        } 
        else if ("Reimbursement".equalsIgnoreCase(tx.getCategory()) && "Completed".equals(newStatus)) {
            updateReimbursementRecord(stripeRefId, tx.getAmount());
        }
    }
    
    private String mapStripeEventToStatus(String eventType) {
        return switch (eventType) {
            case "payment_intent.succeeded" -> "Completed";
            case "payment_intent.payment_failed" -> "Failed";
            case "payment_intent.processing" -> "Processing";
            default -> null; // We currently dont care about other statuses for these specific updates
        };
    }

    private void updateReimbursementRecord(String stripeRefId, BigDecimal amount) {
        // 1. Find the reimbursement that matches this stripe reference
        Optional<Reimbursement> reimbursementOpt = reimbursementRepository.findByStripeRefId(stripeRefId);

        if (reimbursementOpt.isPresent()) {
            Reimbursement reimbursement = reimbursementOpt.get();
            
            // Avoid double-counting if the webhook is sent twice (idempotency)
            if ("PAID".equalsIgnoreCase(reimbursement.getStatus())) {
                logger.info("ℹ️ Reimbursement ID: {} already marked as PAID. Skipping budget update.", reimbursement.getReimbursementId());
                return;
            }

            // 2. Mark the reimbursement as Paid
            reimbursement.setStatus("PAID");
            reimbursementRepository.save(reimbursement);
            logger.info("✅ Reimbursement ID: {} marked as Paid via Webhook", reimbursement.getReimbursementId());

            // 3. Update the Budget Category Spent Amount
            // Here we use the specific category stored in the reimbursement record
            int currentYear = java.time.LocalDate.now().getYear();
            
            try {
                budgetRepository.updateSpentAmount(
                    reimbursement.getClubId(), 
                    currentYear, 
                    reimbursement.getCategory(), // This is the budget category (e.g., 'Food & Beverages')
                    amount
                );
                logger.info("📊 Budget Category '{}' updated for Club ID: {}. Added: {}", 
                    reimbursement.getCategory(), reimbursement.getClubId(), amount);
            } catch (Exception e) {
                // We log the error but don't fail the transaction, 
                // as the payment itself was successful.
                logger.error("❌ Failed to update budget for reimbursement: {}", reimbursement.getReimbursementId(), e);
            }
        } else {
            logger.warn("⚠️ Webhook received for Reimbursement but no matching record found for Stripe Ref: {}", stripeRefId);
        }
    }

    private void updateDueRecord(Long dueId, String oldStatus, String newStatus, BigDecimal transAmount) {
        MemberDue due = duesRepository.findById(dueId)
                .orElseThrow(() -> new RuntimeException("Due record not found for ID: " + dueId));

        // Logic: Only add amount if we are transitioning to 'Completed' from a non-completed state
        if ("Completed".equals(newStatus) && !"Completed".equals(oldStatus)) {
            BigDecimal currentPaid = (due.getPaidAmount() != null) ? due.getPaidAmount() : BigDecimal.ZERO;
            BigDecimal updatedTotalPaid = currentPaid.add(transAmount);
            
            due.setPaidAmount(updatedTotalPaid);
            due.setLastPaymentDate(Instant.now());

            // Check if fully paid or partial
            if (updatedTotalPaid.compareTo(due.getTotalAmount()) >= 0) {
                due.setStatus("Paid");
            } else {
                due.setStatus("Partial");
            }
        } 
        else if ("Processing".equals(newStatus)) {
            due.setStatus("Processing");
        } 
        else if ("Failed".equals(newStatus)) {
            // If the transaction failed, and the due isn't already 'Paid' from another source, reset it
            if (!"Paid".equals(due.getStatus()) && !"Partial".equals(due.getStatus())) {
                due.setStatus("Unpaid");
            }
        }

        duesRepository.save(due);
        logger.info("Updated Due ID: {} status to {}", dueId, due.getStatus());
    }
}