package com.exchkr.club.management.model.api.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request for Unit money movement: ACH, wire, or internal transfer.
 */
public class UnitPaymentRequest {

    @NotNull
    private String sourceAccountId;  // Unit account ID to debit

    @NotNull
    private String destinationAccountId;  // Unit account ID or counterparty

    @NotNull
    @Min(1)
    private Long amount;  // in cents

    private String description;
    private String paymentType;  // ach, wire, book (internal transfer)
    private String counterpartyId;  // for ACH/wire to external
    private String counterpartyRoutingNumber;
    private String counterpartyAccountNumber;
    private String counterpartyAccountType;  // Checking, Savings
    private String counterpartyName;

    public String getSourceAccountId() { return sourceAccountId; }
    public void setSourceAccountId(String sourceAccountId) { this.sourceAccountId = sourceAccountId; }
    public String getDestinationAccountId() { return destinationAccountId; }
    public void setDestinationAccountId(String destinationAccountId) { this.destinationAccountId = destinationAccountId; }
    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }
    public String getCounterpartyId() { return counterpartyId; }
    public void setCounterpartyId(String counterpartyId) { this.counterpartyId = counterpartyId; }
    public String getCounterpartyRoutingNumber() { return counterpartyRoutingNumber; }
    public void setCounterpartyRoutingNumber(String counterpartyRoutingNumber) { this.counterpartyRoutingNumber = counterpartyRoutingNumber; }
    public String getCounterpartyAccountNumber() { return counterpartyAccountNumber; }
    public void setCounterpartyAccountNumber(String counterpartyAccountNumber) { this.counterpartyAccountNumber = counterpartyAccountNumber; }
    public String getCounterpartyAccountType() { return counterpartyAccountType; }
    public void setCounterpartyAccountType(String counterpartyAccountType) { this.counterpartyAccountType = counterpartyAccountType; }
    public String getCounterpartyName() { return counterpartyName; }
    public void setCounterpartyName(String counterpartyName) { this.counterpartyName = counterpartyName; }
}
