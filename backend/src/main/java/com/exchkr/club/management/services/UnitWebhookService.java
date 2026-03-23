package com.exchkr.club.management.services;

import java.util.Map;

/**
 * Processes Unit.co webhook events (application approved, payment completed, etc.).
 */
public interface UnitWebhookService {

    /**
     * Process incoming webhook payload.
     * Events: application.approved, customer.created, account.created, etc.
     */
    void processEvent(Map<String, Object> payload);
}
