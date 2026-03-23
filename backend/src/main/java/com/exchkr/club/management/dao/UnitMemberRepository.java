package com.exchkr.club.management.dao;

import com.exchkr.club.management.model.entity.UnitMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UnitMemberRepository extends JpaRepository<UnitMember, Long> {

    Optional<UnitMember> findByUserId(Long userId);

    Optional<UnitMember> findByUnitApplicationId(String unitApplicationId);

    List<UnitMember> findByUnitAccountIdIsNullAndUnitApplicationIdIsNotNull();

    boolean existsByUserId(Long userId);
}
