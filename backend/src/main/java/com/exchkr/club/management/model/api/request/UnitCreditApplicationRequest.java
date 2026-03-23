package com.exchkr.club.management.model.api.request;

import jakarta.validation.constraints.NotNull;

/**
 * Request to apply for Unit capital (loan or credit line).
 */
public class UnitCreditApplicationRequest {

    @NotNull
    private Long clubId;

    @NotNull
    private String unitCustomerId;

    private Long requestedAmount;  // in cents
    private String productType;  // lineOfCredit, termLoan, etc.
    private String purpose;

    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }
    public String getUnitCustomerId() { return unitCustomerId; }
    public void setUnitCustomerId(String unitCustomerId) { this.unitCustomerId = unitCustomerId; }
    public Long getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(Long requestedAmount) { this.requestedAmount = requestedAmount; }
    public String getProductType() { return productType; }
    public void setProductType(String productType) { this.productType = productType; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
}
