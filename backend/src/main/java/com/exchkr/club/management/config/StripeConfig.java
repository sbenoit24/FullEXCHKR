package com.exchkr.club.management.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import com.stripe.Stripe;

@Configuration
public class StripeConfig {

    @Value("${STRIPE_API_SECRET_KEY}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {

        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new IllegalStateException("❌ Stripe secret key is NOT configured!");
        }

        Stripe.apiKey = stripeSecretKey;

    }
}
