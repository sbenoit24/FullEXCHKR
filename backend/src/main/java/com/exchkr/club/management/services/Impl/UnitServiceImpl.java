package com.exchkr.club.management.services.Impl;

import com.exchkr.club.management.dao.ClubRepository;
import com.exchkr.club.management.dao.UnitCardRepository;
import com.exchkr.club.management.dao.UnitClubRepository;
import com.exchkr.club.management.dao.UnitMemberRepository;
import com.exchkr.club.management.model.entity.Club;
import com.exchkr.club.management.model.entity.UnitCard;
import com.exchkr.club.management.model.entity.UnitClub;
import com.exchkr.club.management.model.entity.UnitMember;
import com.exchkr.club.management.model.api.request.*;
import com.exchkr.club.management.services.UnitService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class UnitServiceImpl implements UnitService {

    private final String apiToken;
    private final String apiBaseUrl;
    private final RestTemplate restTemplate;
    private final UnitClubRepository unitClubRepository;
    private final UnitMemberRepository unitMemberRepository;
    private final UnitCardRepository unitCardRepository;
    private final ClubRepository clubRepository;

    public UnitServiceImpl(@Qualifier("unitApiToken") String apiToken,
                           @Qualifier("unitApiBaseUrl") String apiBaseUrl,
                           RestTemplate restTemplate,
                           UnitClubRepository unitClubRepository,
                           UnitMemberRepository unitMemberRepository,
                           UnitCardRepository unitCardRepository,
                           ClubRepository clubRepository) {
        this.apiToken = apiToken;
        this.apiBaseUrl = apiBaseUrl;
        this.restTemplate = restTemplate;
        this.unitClubRepository = unitClubRepository;
        this.unitMemberRepository = unitMemberRepository;
        this.unitCardRepository = unitCardRepository;
        this.clubRepository = clubRepository;
    }

    private HttpHeaders unitHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.api+json"));
        headers.set("Authorization", "Bearer " + apiToken);
        return headers;
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> err = new HashMap<>();
        err.put("error", message);
        return err;
    }

    @Override
    public Map<String, Object> getIdentity() {
        if (apiToken == null || apiToken.isBlank()) {
            return error("Unit API token is not configured. Set UNIT_API_TOKEN environment variable.");
        }
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "identity",
                    HttpMethod.GET,
                    new HttpEntity<>(unitHeaders()),
                    Map.class
            );
            return response.getBody() != null ? response.getBody() : Map.of("status", "ok");
        } catch (Exception e) {
            return error("Failed to connect to Unit API: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Map<String, Object> createClubAccount(UnitClubOnboardRequest request) {
        if (apiToken == null || apiToken.isBlank()) return error("Unit API token not configured.");
        if (unitClubRepository.existsByClubId(request.getClubId())) {
            return error("Club already has a Unit account.");
        }
        Optional<Club> clubOpt = clubRepository.findById(request.getClubId());
        if (clubOpt.isEmpty()) return error("Club not found.");

        Club club = clubOpt.get();
        String name = request.getBusinessName() != null ? request.getBusinessName() : club.getClubName();
        String email = request.getContactEmail();
        String phone = request.getContactPhone();

        Map<String, Object> application = new HashMap<>();
        application.put("type", "businessApplication");
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("name", name);
        attrs.put("ein", request.getEin() != null ? request.getEin() : "123456789");
        attrs.put("entityType", request.getEntityType() != null ? request.getEntityType() : "Corporation");
        attrs.put("stateOfIncorporation", request.getStateOfIncorporation() != null ? request.getStateOfIncorporation() : "DE");
        attrs.put("purpose", "Club operations");
        attrs.put("phone", phone != null ? Map.of("countryCode", "1", "number", phone.replaceAll("\\D", "")) : Map.of("countryCode", "1", "number", "5555555555"));
        attrs.put("address", buildAddress(request.getAddressStreet(), request.getAddressCity(), request.getAddressState(), request.getAddressPostalCode(), request.getAddressCountry()));
        attrs.put("contact", buildContact(name, email, phone));
        attrs.put("annualRevenue", "Between250kAnd500k");
        attrs.put("numberOfEmployees", "Between1And10");
        attrs.put("cashFlow", "Predictable");
        attrs.put("yearOfIncorporation", "2020");
        attrs.put("countriesOfOperation", List.of("US"));
        attrs.put("ip", "127.0.0.1");
        application.put("attributes", attrs);

        Map<String, Object> payload = Map.of("data", application);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "applications",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, unitHeaders()),
                    Map.class
            );
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                String appId = (String) data.get("id");
                String status = (String) ((Map<?, ?>) data.getOrDefault("attributes", Map.of())).get("status");

                UnitClub uc = new UnitClub();
                uc.setClubId(request.getClubId());
                uc.setUnitApplicationId(appId);
                uc.setStatus(status != null ? status : "Pending");
                unitClubRepository.save(uc);

                Map<String, Object> result = new HashMap<>();
                result.put("applicationId", appId);
                result.put("status", uc.getStatus());
                result.put("message", "Application submitted. Account will be created when approved (webhook or poll).");
                return result;
            }
            return body != null ? body : error("No response from Unit API");
        } catch (Exception e) {
            return error("Unit API error: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Map<String, Object> createMemberWallet(UnitMemberOnboardRequest request) {
        if (apiToken == null || apiToken.isBlank()) return error("Unit API token not configured.");
        if (unitMemberRepository.existsByUserId(request.getUserId())) {
            return error("Member already has a Unit wallet.");
        }

        String firstName = request.getFirstName() != null ? request.getFirstName() : "Member";
        String lastName = request.getLastName() != null ? request.getLastName() : "User";
        String email = request.getEmail() != null ? request.getEmail() : "member@example.com";
        String phone = request.getPhone() != null ? request.getPhone() : "5555555555";
        String dob = request.getDateOfBirth() != null ? request.getDateOfBirth() : "1990-01-01";
        String ssn = request.getSsn() != null ? request.getSsn() : "1234";

        Map<String, Object> application = new HashMap<>();
        application.put("type", "individualApplication");
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("ssn", ssn.length() == 4 ? "0000" + ssn : ssn);
        attrs.put("fullName", Map.of("first", firstName, "last", lastName));
        attrs.put("dateOfBirth", dob);
        attrs.put("email", email);
        attrs.put("phone", Map.of("countryCode", "1", "number", phone.replaceAll("\\D", "")));
        attrs.put("address", buildAddress(request.getAddressStreet(), request.getAddressCity(), request.getAddressState(), request.getAddressPostalCode(), request.getAddressCountry()));
        attrs.put("ip", "127.0.0.1");
        application.put("attributes", attrs);

        Map<String, Object> payload = Map.of("data", application);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "applications",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, unitHeaders()),
                    Map.class
            );
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                String appId = (String) data.get("id");
                String status = (String) ((Map<?, ?>) data.getOrDefault("attributes", Map.of())).get("status");

                UnitMember um = new UnitMember();
                um.setUserId(request.getUserId());
                um.setUnitApplicationId(appId);
                um.setStatus(status != null ? status : "Pending");
                unitMemberRepository.save(um);

                Map<String, Object> result = new HashMap<>();
                result.put("applicationId", appId);
                result.put("status", um.getStatus());
                result.put("message", "Application submitted. Wallet will be created when approved.");
                return result;
            }
            return body != null ? body : error("No response from Unit API");
        } catch (Exception e) {
            return error("Unit API error: " + e.getMessage());
        }
    }

    private Map<String, Object> buildAddress(String street, String city, String state, String postal, String country) {
        Map<String, Object> addr = new HashMap<>();
        addr.put("street", street != null ? street : "123 Main St");
        addr.put("city", city != null ? city : "New York");
        addr.put("state", state != null ? state : "NY");
        addr.put("postalCode", postal != null ? postal : "10001");
        addr.put("country", country != null ? country : "US");
        return addr;
    }

    private Map<String, Object> buildContact(String name, String email, String phone) {
        Map<String, Object> contact = new HashMap<>();
        contact.put("fullName", Map.of("first", name.split(" ")[0], "last", name.contains(" ") ? name.substring(name.indexOf(" ") + 1) : ""));
        contact.put("email", email != null ? email : "contact@club.com");
        contact.put("phone", Map.of("countryCode", "1", "number", phone != null ? phone.replaceAll("\\D", "") : "5555555555"));
        return contact;
    }

    @Override
    public Map<String, Object> getClubBalance(Long clubId) {
        Optional<UnitClub> opt = unitClubRepository.findByClubId(clubId);
        if (opt.isEmpty() || opt.get().getUnitAccountId() == null) {
            return error("Club has no Unit account or account not yet created.");
        }
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "accounts/" + opt.get().getUnitAccountId() + "/balance",
                    HttpMethod.GET,
                    new HttpEntity<>(unitHeaders()),
                    Map.class
            );
            return response.getBody() != null ? response.getBody() : Map.of("balance", 0);
        } catch (Exception e) {
            return error("Failed to get balance: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getMemberBalance(Long userId) {
        Optional<UnitMember> opt = unitMemberRepository.findByUserId(userId);
        if (opt.isEmpty() || opt.get().getUnitAccountId() == null) {
            return error("Member has no Unit wallet or wallet not yet created.");
        }
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "accounts/" + opt.get().getUnitAccountId() + "/balance",
                    HttpMethod.GET,
                    new HttpEntity<>(unitHeaders()),
                    Map.class
            );
            return response.getBody() != null ? response.getBody() : Map.of("balance", 0);
        } catch (Exception e) {
            return error("Failed to get balance: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getClubUnitStatus(Long clubId) {
        Optional<UnitClub> opt = unitClubRepository.findByClubId(clubId);
        if (opt.isEmpty()) return Map.of("hasUnit", false, "message", "Club not onboarded to Unit");
        UnitClub uc = opt.get();
        Map<String, Object> status = new HashMap<>();
        status.put("hasUnit", true);
        status.put("applicationId", uc.getUnitApplicationId());
        status.put("customerId", uc.getUnitCustomerId());
        status.put("accountId", uc.getUnitAccountId());
        status.put("status", uc.getStatus());
        return status;
    }

    @Override
    public Map<String, Object> getMemberUnitStatus(Long userId) {
        Optional<UnitMember> opt = unitMemberRepository.findByUserId(userId);
        if (opt.isEmpty()) return Map.of("hasUnit", false, "message", "Member not onboarded to Unit");
        UnitMember um = opt.get();
        Map<String, Object> status = new HashMap<>();
        status.put("hasUnit", true);
        status.put("applicationId", um.getUnitApplicationId());
        status.put("customerId", um.getUnitCustomerId());
        status.put("accountId", um.getUnitAccountId());
        status.put("status", um.getStatus());
        return status;
    }

    @Override
    public Map<String, Object> createAchPayment(UnitPaymentRequest request) {
        return createPayment(request, "ach");
    }

    @Override
    public Map<String, Object> createWirePayment(UnitPaymentRequest request) {
        return createPayment(request, "wire");
    }

    @Override
    public Map<String, Object> createTransfer(UnitPaymentRequest request) {
        return createPayment(request, "book");
    }

    private Map<String, Object> createPayment(UnitPaymentRequest request, String type) {
        if (apiToken == null || apiToken.isBlank()) return error("Unit API token not configured.");
        Map<String, Object> payment = new HashMap<>();
        payment.put("type", type + "Payment");
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("amount", request.getAmount());
        attrs.put("direction", "Debit");
        attrs.put("counterpartyAccountId", request.getDestinationAccountId());
        if (request.getDescription() != null) attrs.put("description", request.getDescription());
        payment.put("attributes", attrs);
        Map<String, Object> rels = new HashMap<>();
        rels.put("account", Map.of("data", Map.of("type", "depositAccount", "id", request.getSourceAccountId())));
        payment.put("relationships", rels);
        Map<String, Object> payload = Map.of("data", payment);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "payments",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, unitHeaders()),
                    Map.class
            );
            return response.getBody() != null ? response.getBody() : Map.of("status", "submitted");
        } catch (Exception e) {
            return error("Payment failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Map<String, Object> createCard(UnitCardRequest request) {
        if (apiToken == null || apiToken.isBlank()) return error("Unit API token not configured.");
        Map<String, Object> card = new HashMap<>();
        card.put("type", "individualDebitCard");
        Map<String, Object> attrs = new HashMap<>();
        if (request.getShippingAddressStreet() != null) {
            attrs.put("shippingAddress", buildAddress(
                    request.getShippingAddressStreet(), request.getShippingAddressCity(),
                    request.getShippingAddressState(), request.getShippingAddressPostalCode(),
                    request.getShippingAddressCountry()));
        }
        card.put("attributes", attrs);
        card.put("relationships", Map.of("account", Map.of("data", Map.of("type", "depositAccount", "id", request.getAccountId()))));
        Map<String, Object> payload = Map.of("data", card);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "cards",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, unitHeaders()),
                    Map.class
            );
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("data") && request.getOwnerType() != null && request.getOwnerId() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                String cardId = (String) data.get("id");
                UnitCard uc = new UnitCard();
                uc.setUnitCardId(cardId);
                uc.setOwnerType(request.getOwnerType());
                uc.setOwnerId(request.getOwnerId());
                uc.setUnitAccountId(request.getAccountId());
                uc.setCardType(request.getCardType());
                unitCardRepository.save(uc);
            }
            return body != null ? body : Map.of("status", "created");
        } catch (Exception e) {
            return error("Card creation failed: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getCards(String ownerType, Long ownerId) {
        List<UnitCard> cards = unitCardRepository.findByOwnerTypeAndOwnerId(ownerType, ownerId);
        List<Map<String, Object>> list = new ArrayList<>();
        for (UnitCard c : cards) {
            Map<String, Object> m = new HashMap<>();
            m.put("cardId", c.getUnitCardId());
            m.put("status", c.getStatus());
            m.put("lastFour", c.getLastFour());
            m.put("cardType", c.getCardType());
            list.add(m);
        }
        return Map.of("cards", list);
    }

    @Override
    public Map<String, Object> createCreditApplication(UnitCreditApplicationRequest request) {
        if (apiToken == null || apiToken.isBlank()) return error("Unit API token not configured.");
        Map<String, Object> app = new HashMap<>();
        app.put("type", "creditApplication");
        Map<String, Object> attrs = new HashMap<>();
        if (request.getRequestedAmount() != null) attrs.put("amount", request.getRequestedAmount());
        if (request.getPurpose() != null) attrs.put("purpose", request.getPurpose());
        app.put("attributes", attrs);
        app.put("relationships", Map.of("customer", Map.of("data", Map.of("type", "customer", "id", request.getUnitCustomerId()))));
        Map<String, Object> payload = Map.of("data", app);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "credit-applications",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, unitHeaders()),
                    Map.class
            );
            return response.getBody() != null ? response.getBody() : Map.of("status", "submitted");
        } catch (Exception e) {
            return error("Credit application failed: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getCreditApplicationStatus(String applicationId) {
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "credit-applications/" + applicationId,
                    HttpMethod.GET,
                    new HttpEntity<>(unitHeaders()),
                    Map.class
            );
            return response.getBody() != null ? response.getBody() : Map.of("status", "unknown");
        } catch (Exception e) {
            return error("Failed to get status: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Map<String, Object> syncApplicationStatus(String applicationId) {
        if (apiToken == null || apiToken.isBlank()) return error("Unit API token not configured.");
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "applications/" + applicationId,
                    HttpMethod.GET,
                    new HttpEntity<>(unitHeaders()),
                    Map.class
            );
            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey("data")) return error("Application not found.");
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) body.get("data");
            String status = (String) ((Map<?, ?>) data.getOrDefault("attributes", Map.of())).get("status");
            if (!"Approved".equalsIgnoreCase(status)) {
                return Map.of("applicationId", applicationId, "status", status != null ? status : "unknown",
                        "message", "Application not yet approved. Current status: " + status);
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> rels = (Map<String, Object>) data.get("relationships");
            if (rels == null) return error("No relationships in application.");
            Map<String, Object> customerRel = (Map<String, Object>) rels.get("customer");
            if (customerRel == null) return error("No customer in approved application.");
            Map<String, Object> customerData = (Map<String, Object>) customerRel.get("data");
            if (customerData == null) return error("No customer data.");
            String customerId = (String) customerData.get("id");
            if (customerId == null) return error("No customer ID.");

            Optional<UnitClub> clubOpt = unitClubRepository.findByUnitApplicationId(applicationId);
            if (clubOpt.isPresent()) {
                UnitClub uc = clubOpt.get();
                if (uc.getUnitAccountId() != null) return Map.of("applicationId", applicationId, "status", "Active", "message", "Already synced.");
                uc.setUnitCustomerId(customerId);
                uc.setStatus("Approved");
                unitClubRepository.save(uc);
                createDepositAccountForClub(uc, customerId);
                return Map.of("applicationId", applicationId, "status", "Active", "message", "Club account created.");
            }
            Optional<UnitMember> memberOpt = unitMemberRepository.findByUnitApplicationId(applicationId);
            if (memberOpt.isPresent()) {
                UnitMember um = memberOpt.get();
                if (um.getUnitAccountId() != null) return Map.of("applicationId", applicationId, "status", "Active", "message", "Already synced.");
                um.setUnitCustomerId(customerId);
                um.setStatus("Approved");
                unitMemberRepository.save(um);
                createDepositAccountForMember(um, customerId);
                return Map.of("applicationId", applicationId, "status", "Active", "message", "Member wallet created.");
            }
            return error("Application " + applicationId + " not linked to any club or member.");
        } catch (Exception e) {
            return error("Sync failed: " + e.getMessage());
        }
    }

    private void createDepositAccountForClub(UnitClub uc, String customerId) {
        try {
            Map<String, Object> account = Map.of(
                    "type", "depositAccount",
                    "attributes", Map.of("depositProduct", "checking"),
                    "relationships", Map.of("customer", Map.of("data", Map.of("type", "customer", "id", customerId)))
            );
            Map<String, Object> payload = Map.of("data", account);
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "accounts",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, unitHeaders()),
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
            throw new RuntimeException("Failed to create deposit account: " + e.getMessage());
        }
    }

    private void createDepositAccountForMember(UnitMember um, String customerId) {
        try {
            Map<String, Object> account = Map.of(
                    "type", "depositAccount",
                    "attributes", Map.of("depositProduct", "checking"),
                    "relationships", Map.of("customer", Map.of("data", Map.of("type", "customer", "id", customerId)))
            );
            Map<String, Object> payload = Map.of("data", account);
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiBaseUrl + "accounts",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, unitHeaders()),
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
            throw new RuntimeException("Failed to create deposit account: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Map<String, Object> syncAllPendingApplications() {
        if (apiToken == null || apiToken.isBlank()) return error("Unit API token not configured.");
        List<String> synced = new ArrayList<>();
        List<String> failed = new ArrayList<>();
        for (UnitClub uc : unitClubRepository.findByUnitAccountIdIsNullAndUnitApplicationIdIsNotNull()) {
            Map<String, Object> r = syncApplicationStatus(uc.getUnitApplicationId());
            if (r.containsKey("error")) failed.add(uc.getUnitApplicationId() + ": " + r.get("error"));
            else synced.add("club:" + uc.getClubId());
        }
        for (UnitMember um : unitMemberRepository.findByUnitAccountIdIsNullAndUnitApplicationIdIsNotNull()) {
            Map<String, Object> r = syncApplicationStatus(um.getUnitApplicationId());
            if (r.containsKey("error")) failed.add(um.getUnitApplicationId() + ": " + r.get("error"));
            else synced.add("member:" + um.getUserId());
        }
        Map<String, Object> result = new HashMap<>();
        result.put("synced", synced);
        result.put("failed", failed);
        return result;
    }
}
