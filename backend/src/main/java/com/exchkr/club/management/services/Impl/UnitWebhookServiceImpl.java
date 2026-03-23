package com.exchkr.club.management.services.Impl;

import com.exchkr.club.management.dao.UnitClubRepository;
import com.exchkr.club.management.dao.UnitMemberRepository;
import com.exchkr.club.management.model.entity.UnitClub;
import com.exchkr.club.management.model.entity.UnitMember;
import com.exchkr.club.management.services.UnitWebhookService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UnitWebhookServiceImpl implements UnitWebhookService {

    private static final Logger log = LoggerFactory.getLogger(UnitWebhookServiceImpl.class);

    private final String apiToken;
    private final String apiBaseUrl;
    private final RestTemplate restTemplate;
    private final UnitClubRepository unitClubRepository;
    private final UnitMemberRepository unitMemberRepository;

    public UnitWebhookServiceImpl(@Qualifier("unitApiToken") String apiToken,
                                  @Qualifier("unitApiBaseUrl") String apiBaseUrl,
                                  RestTemplate restTemplate,
                                  UnitClubRepository unitClubRepository,
                                  UnitMemberRepository unitMemberRepository) {
        this.apiToken = apiToken;
        this.apiBaseUrl = apiBaseUrl;
        this.restTemplate = restTemplate;
        this.unitClubRepository = unitClubRepository;
        this.unitMemberRepository = unitMemberRepository;
    }

    @Override
    public void processEvent(Map<String, Object> payload) {
        Object dataObj = payload.get("data");
        if (dataObj == null) return;

        List<Map<String, Object>> events = dataObj instanceof List
                ? (List<Map<String, Object>>) dataObj
                : List.of((Map<String, Object>) dataObj);

        for (Map<String, Object> event : events) {
            String type = (String) event.get("type");
            if (type == null) continue;
            switch (type) {
                case "application.approved", "customer.created" -> handleApplicationApproved(event);
                case "account.created" -> handleAccountCreated(event);
                default -> log.debug("Unit webhook event type not handled: {}", type);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void handleApplicationApproved(Map<String, Object> event) {
        Map<String, Object> relationships = (Map<String, Object>) event.get("relationships");
        if (relationships == null) return;

        Map<String, Object> appRel = (Map<String, Object>) relationships.get("application");
        Map<String, Object> customerRel = (Map<String, Object>) relationships.get("customer");
        if (appRel == null || customerRel == null) return;

        Map<String, Object> appData = (Map<String, Object>) appRel.get("data");
        Map<String, Object> customerData = (Map<String, Object>) customerRel.get("data");
        if (appData == null || customerData == null) return;

        String appId = (String) appData.get("id");
        String customerId = (String) customerData.get("id");

        Optional<UnitClub> clubOpt = unitClubRepository.findByUnitApplicationId(appId);
        if (clubOpt.isPresent()) {
            UnitClub uc = clubOpt.get();
            uc.setUnitCustomerId(customerId);
            uc.setStatus("Approved");
            unitClubRepository.save(uc);
            createDepositAccountForCustomer(customerId, uc);
            return;
        }

        Optional<UnitMember> memberOpt = unitMemberRepository.findByUnitApplicationId(appId);
        if (memberOpt.isPresent()) {
            UnitMember um = memberOpt.get();
            um.setUnitCustomerId(customerId);
            um.setStatus("Approved");
            unitMemberRepository.save(um);
            createDepositAccountForCustomer(customerId, um);
        }
    }

    private void createDepositAccountForCustomer(String customerId, UnitClub uc) {
        try {
            Map<String, Object> account = Map.of(
                    "type", "depositAccount",
                    "attributes", Map.of("depositProduct", "checking"),
                    "relationships", Map.of("customer", Map.of("data", Map.of("type", "customer", "id", customerId)))
            );
            Map<String, Object> payload = Map.of("data", account);
            HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.api+json"));
            headers.set("Authorization", "Bearer " + apiToken);

            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "accounts",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, headers),
                    Map.class
            );
            if (response.getBody() != null && response.getBody().containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> resData = (Map<String, Object>) response.getBody().get("data");
                String accountId = (String) resData.get("id");
                uc.setUnitAccountId(accountId);
                uc.setStatus("Active");
                unitClubRepository.save(uc);
            }
        } catch (Exception e) {
            log.error("Failed to create deposit account for club {}: {}", uc.getClubId(), e.getMessage());
        }
    }

    private void createDepositAccountForCustomer(String customerId, UnitMember um) {
        try {
            Map<String, Object> account = Map.of(
                    "type", "depositAccount",
                    "attributes", Map.of("depositProduct", "checking"),
                    "relationships", Map.of("customer", Map.of("data", Map.of("type", "customer", "id", customerId)))
            );
            Map<String, Object> payload = Map.of("data", account);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.api+json"));
            headers.set("Authorization", "Bearer " + apiToken);

            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "accounts",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, headers),
                    Map.class
            );
            if (response.getBody() != null && response.getBody().containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> resData = (Map<String, Object>) response.getBody().get("data");
                String accountId = (String) resData.get("id");
                um.setUnitAccountId(accountId);
                um.setStatus("Active");
                unitMemberRepository.save(um);
            }
        } catch (Exception e) {
            log.error("Failed to create deposit account for member {}: {}", um.getUserId(), e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void handleAccountCreated(Map<String, Object> event) {
        Map<String, Object> relationships = (Map<String, Object>) event.get("relationships");
        if (relationships == null) return;
        Map<String, Object> accountRel = (Map<String, Object>) relationships.get("account");
        if (accountRel == null) return;
        Map<String, Object> accountData = (Map<String, Object>) accountRel.get("data");
        if (accountData == null) return;
        String accountId = (String) accountData.get("id");
        Map<String, Object> customerRel = (Map<String, Object>) relationships.get("customer");
        if (customerRel == null) return;
        Map<String, Object> customerData = (Map<String, Object>) customerRel.get("data");
        if (customerData == null) return;
        String customerId = (String) customerData.get("id");

        unitClubRepository.findAll().stream()
                .filter(uc -> customerId.equals(uc.getUnitCustomerId()) && uc.getUnitAccountId() == null)
                .findFirst()
                .ifPresent(uc -> {
                    uc.setUnitAccountId(accountId);
                    uc.setStatus("Active");
                    unitClubRepository.save(uc);
                });
        unitMemberRepository.findAll().stream()
                .filter(um -> customerId.equals(um.getUnitCustomerId()) && um.getUnitAccountId() == null)
                .findFirst()
                .ifPresent(um -> {
                    um.setUnitAccountId(accountId);
                    um.setStatus("Active");
                    unitMemberRepository.save(um);
                });
    }
}
