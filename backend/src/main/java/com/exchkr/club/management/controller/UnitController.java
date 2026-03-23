package com.exchkr.club.management.controller;

import com.exchkr.club.management.model.api.request.*;
import com.exchkr.club.management.security.CustomUserDetails;
import com.exchkr.club.management.services.UnitService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/unit")
public class UnitController {

    @Autowired
    private UnitService unitService;

    /**
     * Verifies Unit API connection.
     * GET /exchkr/api/unit/identity
     */
    @GetMapping("/identity")
    public ResponseEntity<Map<String, Object>> getIdentity() {
        Map<String, Object> result = unitService.getIdentity();
        if (result.containsKey("error")) {
            return ResponseEntity.status(401).body(result);
        }
        return ResponseEntity.ok(result);
    }

    // --- DEPOSIT ACCOUNTS ---

    /**
     * Create Unit business account for a club.
     * POST /exchkr/api/unit/club/account
     */
    @PostMapping("/club/account")
    public ResponseEntity<Map<String, Object>> createClubAccount(
            @Valid @RequestBody UnitClubOnboardRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Map<String, Object> result = unitService.createClubAccount(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Create Unit wallet for a member.
     * POST /exchkr/api/unit/member/wallet
     */
    @PostMapping("/member/wallet")
    public ResponseEntity<Map<String, Object>> createMemberWallet(
            @Valid @RequestBody UnitMemberOnboardRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Map<String, Object> result = unitService.createMemberWallet(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Get club's Unit account balance.
     * GET /exchkr/api/unit/club/{clubId}/balance
     */
    @GetMapping("/club/{clubId}/balance")
    public ResponseEntity<Map<String, Object>> getClubBalance(@PathVariable Long clubId) {
        Map<String, Object> result = unitService.getClubBalance(clubId);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Get member's Unit wallet balance.
     * GET /exchkr/api/unit/member/{userId}/balance
     */
    @GetMapping("/member/{userId}/balance")
    public ResponseEntity<Map<String, Object>> getMemberBalance(@PathVariable Long userId) {
        Map<String, Object> result = unitService.getMemberBalance(userId);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Get club's Unit status.
     * GET /exchkr/api/unit/club/{clubId}/status
     */
    @GetMapping("/club/{clubId}/status")
    public ResponseEntity<Map<String, Object>> getClubUnitStatus(@PathVariable Long clubId) {
        return ResponseEntity.ok(unitService.getClubUnitStatus(clubId));
    }

    /**
     * Get member's Unit status.
     * GET /exchkr/api/unit/member/{userId}/status
     */
    @GetMapping("/member/{userId}/status")
    public ResponseEntity<Map<String, Object>> getMemberUnitStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(unitService.getMemberUnitStatus(userId));
    }

    /**
     * Sync application status with Unit API. Use when webhooks are not available (pre-launch).
     * If approved, creates deposit account and updates local records.
     * GET /exchkr/api/unit/applications/{applicationId}/sync
     */
    @GetMapping("/applications/{applicationId}/sync")
    public ResponseEntity<Map<String, Object>> syncApplicationStatus(@PathVariable String applicationId) {
        Map<String, Object> result = unitService.syncApplicationStatus(applicationId);
        if (result.containsKey("error")) return ResponseEntity.badRequest().body(result);
        return ResponseEntity.ok(result);
    }

    /**
     * Sync all pending club and member applications. No webhook needed.
     * POST /exchkr/api/unit/applications/sync-all
     */
    @PostMapping("/applications/sync-all")
    public ResponseEntity<Map<String, Object>> syncAllPendingApplications() {
        Map<String, Object> result = unitService.syncAllPendingApplications();
        if (result.containsKey("error")) return ResponseEntity.badRequest().body(result);
        return ResponseEntity.ok(result);
    }

    // --- MONEY MOVEMENT ---

    /**
     * Create ACH payment.
     * POST /exchkr/api/unit/payments/ach
     */
    @PostMapping("/payments/ach")
    public ResponseEntity<Map<String, Object>> createAchPayment(
            @Valid @RequestBody UnitPaymentRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Map<String, Object> result = unitService.createAchPayment(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Create wire payment.
     * POST /exchkr/api/unit/payments/wire
     */
    @PostMapping("/payments/wire")
    public ResponseEntity<Map<String, Object>> createWirePayment(
            @Valid @RequestBody UnitPaymentRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Map<String, Object> result = unitService.createWirePayment(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Create internal transfer between Unit accounts.
     * POST /exchkr/api/unit/payments/transfer
     */
    @PostMapping("/payments/transfer")
    public ResponseEntity<Map<String, Object>> createTransfer(
            @Valid @RequestBody UnitPaymentRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Map<String, Object> result = unitService.createTransfer(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    // --- CARD ISSUING ---

    /**
     * Create debit or credit card.
     * POST /exchkr/api/unit/cards
     */
    @PostMapping("/cards")
    public ResponseEntity<Map<String, Object>> createCard(
            @Valid @RequestBody UnitCardRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Map<String, Object> result = unitService.createCard(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Get cards for a club or member.
     * GET /exchkr/api/unit/cards?ownerType=CLUB&ownerId=1
     */
    @GetMapping("/cards")
    public ResponseEntity<Map<String, Object>> getCards(
            @RequestParam String ownerType,
            @RequestParam Long ownerId) {
        return ResponseEntity.ok(unitService.getCards(ownerType, ownerId));
    }

    // --- CAPITAL ---

    /**
     * Apply for Unit capital (loan/credit line).
     * POST /exchkr/api/unit/credit/apply
     */
    @PostMapping("/credit/apply")
    public ResponseEntity<Map<String, Object>> createCreditApplication(
            @Valid @RequestBody UnitCreditApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Map<String, Object> result = unitService.createCreditApplication(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Get credit application status.
     * GET /exchkr/api/unit/credit/{applicationId}/status
     */
    @GetMapping("/credit/{applicationId}/status")
    public ResponseEntity<Map<String, Object>> getCreditApplicationStatus(@PathVariable String applicationId) {
        Map<String, Object> result = unitService.getCreditApplicationStatus(applicationId);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}
