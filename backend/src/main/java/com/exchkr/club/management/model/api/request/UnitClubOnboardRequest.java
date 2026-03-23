package com.exchkr.club.management.model.api.request;

import jakarta.validation.constraints.NotNull;

/**
 * Request to onboard a club to Unit.co (create business customer + deposit account).
 */
public class UnitClubOnboardRequest {

    @NotNull
    private Long clubId;

    private String businessName;
    private String ein;
    private String entityType; // Corporation, LLC, Partnership, etc.
    private String stateOfIncorporation;
    private String contactEmail;
    private String contactPhone;
    private String addressStreet;
    private String addressCity;
    private String addressState;
    private String addressPostalCode;
    private String addressCountry = "US";

    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getEin() { return ein; }
    public void setEin(String ein) { this.ein = ein; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getStateOfIncorporation() { return stateOfIncorporation; }
    public void setStateOfIncorporation(String stateOfIncorporation) { this.stateOfIncorporation = stateOfIncorporation; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getAddressStreet() { return addressStreet; }
    public void setAddressStreet(String addressStreet) { this.addressStreet = addressStreet; }
    public String getAddressCity() { return addressCity; }
    public void setAddressCity(String addressCity) { this.addressCity = addressCity; }
    public String getAddressState() { return addressState; }
    public void setAddressState(String addressState) { this.addressState = addressState; }
    public String getAddressPostalCode() { return addressPostalCode; }
    public void setAddressPostalCode(String addressPostalCode) { this.addressPostalCode = addressPostalCode; }
    public String getAddressCountry() { return addressCountry; }
    public void setAddressCountry(String addressCountry) { this.addressCountry = addressCountry; }
}
