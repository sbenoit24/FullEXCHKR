package com.exchkr.club.management.model.api.request;

import jakarta.validation.constraints.NotNull;

/**
 * Request to create a Unit-issued card (debit or credit).
 */
public class UnitCardRequest {

    @NotNull
    private String accountId;  // Unit deposit account to link card to

    private String ownerType;  // CLUB or MEMBER
    private Long ownerId;  // clubId or userId
    private String cardType = "debit";  // debit or credit
    private String shippingAddressStreet;
    private String shippingAddressCity;
    private String shippingAddressState;
    private String shippingAddressPostalCode;
    private String shippingAddressCountry = "US";

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }
    public String getOwnerType() { return ownerType; }
    public void setOwnerType(String ownerType) { this.ownerType = ownerType; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getCardType() { return cardType; }
    public void setCardType(String cardType) { this.cardType = cardType; }
    public String getShippingAddressStreet() { return shippingAddressStreet; }
    public void setShippingAddressStreet(String shippingAddressStreet) { this.shippingAddressStreet = shippingAddressStreet; }
    public String getShippingAddressCity() { return shippingAddressCity; }
    public void setShippingAddressCity(String shippingAddressCity) { this.shippingAddressCity = shippingAddressCity; }
    public String getShippingAddressState() { return shippingAddressState; }
    public void setShippingAddressState(String shippingAddressState) { this.shippingAddressState = shippingAddressState; }
    public String getShippingAddressPostalCode() { return shippingAddressPostalCode; }
    public void setShippingAddressPostalCode(String shippingAddressPostalCode) { this.shippingAddressPostalCode = shippingAddressPostalCode; }
    public String getShippingAddressCountry() { return shippingAddressCountry; }
    public void setShippingAddressCountry(String shippingAddressCountry) { this.shippingAddressCountry = shippingAddressCountry; }
}
