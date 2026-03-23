package com.exchkr.club.management.controller;

import com.exchkr.club.management.services.UnitWebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Receives Unit.co webhook events (application approved, account created, etc.).
 * Configure webhook URL in Unit Dashboard: https://your-domain/exchkr/webhook/unit
 */
@RestController
@RequestMapping("/webhook/unit")
public class UnitWebhookController {

    @Autowired
    private UnitWebhookService unitWebhookService;

    @PostMapping
    public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            unitWebhookService.processEvent(payload);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
