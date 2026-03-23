package com.exchkr.club.management.model.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Links a Unit-issued card to a club or member.
 * type: CLUB or MEMBER, ownerId: clubId or userId
 */
@Entity
@Table(name = "ecm_unit_card")
public class UnitCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "unit_card_id", nullable = false, length = 100)
    private String unitCardId;

    @Column(name = "owner_type", length = 20)
    private String ownerType; // CLUB or MEMBER

    @Column(name = "owner_id")
    private Long ownerId; // clubId or userId

    @Column(name = "unit_account_id", length = 100)
    private String unitAccountId;

    @Column(name = "card_type", length = 20)
    private String cardType; // debit, credit

    @Column(name = "status", length = 30)
    private String status = "Active";

    @Column(name = "last_four", length = 4)
    private String lastFour;

    @Column(name = "created_on", updatable = false)
    private Instant createdOn = Instant.now();

    @Column(name = "updated_on")
    private Instant updatedOn = Instant.now();

    public UnitCard() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUnitCardId() { return unitCardId; }
    public void setUnitCardId(String unitCardId) { this.unitCardId = unitCardId; }
    public String getOwnerType() { return ownerType; }
    public void setOwnerType(String ownerType) { this.ownerType = ownerType; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getUnitAccountId() { return unitAccountId; }
    public void setUnitAccountId(String unitAccountId) { this.unitAccountId = unitAccountId; }
    public String getCardType() { return cardType; }
    public void setCardType(String cardType) { this.cardType = cardType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLastFour() { return lastFour; }
    public void setLastFour(String lastFour) { this.lastFour = lastFour; }
    public Instant getCreatedOn() { return createdOn; }
    public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }
    public Instant getUpdatedOn() { return updatedOn; }
    public void setUpdatedOn(Instant updatedOn) { this.updatedOn = updatedOn; }
}
