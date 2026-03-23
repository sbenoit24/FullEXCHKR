package com.exchkr.club.management.dao;

import com.exchkr.club.management.model.entity.Club;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    // Standard JpaRepository provides save(), findById(), etc.
	@Query("SELECT c.clubName FROM Club c WHERE c.clubId = :clubId")
	Optional<String> findClubNameById(@Param("clubId") Long clubId);
	
	
	// Check if a club with this name and school already exists
    boolean existsByClubNameAndSchoolName(String clubName, String schoolName);
}
