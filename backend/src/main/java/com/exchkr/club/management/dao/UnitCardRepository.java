package com.exchkr.club.management.dao;

import com.exchkr.club.management.model.entity.UnitCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UnitCardRepository extends JpaRepository<UnitCard, Long> {

    Optional<UnitCard> findByUnitCardId(String unitCardId);

    List<UnitCard> findByOwnerTypeAndOwnerId(String ownerType, Long ownerId);

    List<UnitCard> findByOwnerTypeAndOwnerIdAndStatus(String ownerType, Long ownerId, String status);
}
