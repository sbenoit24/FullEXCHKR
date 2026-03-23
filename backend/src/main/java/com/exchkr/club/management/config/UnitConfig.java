package com.exchkr.club.management.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for Unit.co API.
 * Set UNIT_API_TOKEN in your environment - never commit the token.
 */
@Configuration
public class UnitConfig {

    @Value("${unit.api.token:}")
    private String apiToken;

    @Value("${unit.api.url:https://api.s.unit.sh}")
    private String apiBaseUrl;

    /**
     * The Unit API token. Injected from unit.api.token (env: UNIT_API_TOKEN).
     */
    @Bean
    public String unitApiToken() {
        return apiToken;
    }

    /**
     * The Unit API base URL (sandbox: https://api.s.unit.sh, live: https://api.unit.co).
     */
    @Bean
    public String unitApiBaseUrl() {
        return apiBaseUrl.endsWith("/") ? apiBaseUrl : apiBaseUrl + "/";
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
