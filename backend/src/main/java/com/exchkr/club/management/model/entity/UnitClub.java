package com.exchkr.club.management.model.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Links a Club to its Unit.co customer and deposit account.
 * One club can have one Unit customer and one primary deposit account.
 */
@Entity
@Table(name = "ecm_club_unit")
public class UnitClub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "club_id", nullable = false, unique = true)
    private Long clubId;

    @Column(name = "unit_customer_id", length = 100)
    private String unitCustomerId;

    @Column(name = "unit_application_id", length = 100)
    private String unitApplicationId;

    @Column(name = "unit_account_id", length = 100)
    private String unitAccountId;

    @Column(name = "status", length = 30)
    private String status = "pending";

    @Column(name = "created_on", updatable = false)
    private Instant createdOn = Instant.now();

    @Column(name = "updated_on")
    private Instant updatedOn = Instant.now();

    public UnitClub() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }
    public String getUnitCustomerId() { return unitCustomerId; }
    public void setUnitCustomerId(String unitCustomerId) { this.unitCustomerId = unitCustomerId; }
    public String getUnitApplicationId() { return unitApplicationId; }
    public void setUnitApplicationId(String unitApplicationId) { this.unitApplicationId = unitApplicationId; }
    public String getUnitAccountId() { return unitAccountId; }
    public void setUnitAccountId(String unitAccountId) { this.unitAccountId = unitAccountId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedOn() { return createdOn; }
    public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }
    public Instant getUpdatedOn() { return updatedOn; }
    public void setUpdatedOn(Instant updatedOn) { this.updatedOn = updatedOn; }
}
