package com.exchkr.club.management.services;

import com.exchkr.club.management.model.api.request.*;

import java.util.Map;

/**
 * Service for Unit.co API operations: deposit accounts, money movement, cards, capital.
 */
public interface UnitService {

    /** Verifies Unit API connection. */
    Map<String, Object> getIdentity();

    // --- DEPOSIT ACCOUNTS ---

    /** Create Unit business customer + deposit account for a club. */
    Map<String, Object> createClubAccount(UnitClubOnboardRequest request);

    /** Create Unit individual customer + wallet account for a member. */
    Map<String, Object> createMemberWallet(UnitMemberOnboardRequest request);

    /** Get club's Unit account balance. */
    Map<String, Object> getClubBalance(Long clubId);

    /** Get member's Unit wallet balance. */
    Map<String, Object> getMemberBalance(Long userId);

    /** Get club's Unit account status. */
    Map<String, Object> getClubUnitStatus(Long clubId);

    /** Get member's Unit wallet status. */
    Map<String, Object> getMemberUnitStatus(Long userId);

    /**
     * Sync application status with Unit API. Use when you don't have webhooks (e.g. pre-launch).
     * If approved, creates deposit account and updates local records.
     */
    Map<String, Object> syncApplicationStatus(String applicationId);

    /** Sync all pending club and member applications. No webhook needed. */
    Map<String, Object> syncAllPendingApplications();

    // --- MONEY MOVEMENT ---

    /** Create ACH payment. */
    Map<String, Object> createAchPayment(UnitPaymentRequest request);

    /** Create wire payment. */
    Map<String, Object> createWirePayment(UnitPaymentRequest request);

    /** Create internal transfer between Unit accounts. */
    Map<String, Object> createTransfer(UnitPaymentRequest request);

    // --- CARD ISSUING ---

    /** Create debit or credit card. */
    Map<String, Object> createCard(UnitCardRequest request);

    /** Get cards for a club or member. */
    Map<String, Object> getCards(String ownerType, Long ownerId);

    // --- CAPITAL ---

    /** Apply for Unit capital (loan/credit line). */
    Map<String, Object> createCreditApplication(UnitCreditApplicationRequest request);

    /** Get credit application status. */
    Map<String, Object> getCreditApplicationStatus(String applicationId);
}
