package com.exchkr.club.management.dao;

import com.exchkr.club.management.model.entity.UnitClub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UnitClubRepository extends JpaRepository<UnitClub, Long> {

    Optional<UnitClub> findByClubId(Long clubId);

    Optional<UnitClub> findByUnitApplicationId(String unitApplicationId);

    List<UnitClub> findByUnitAccountIdIsNullAndUnitApplicationIdIsNotNull();

    boolean existsByClubId(Long clubId);
}
