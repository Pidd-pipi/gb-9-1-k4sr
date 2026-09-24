package com.knowledge.platform.repository;

import com.knowledge.platform.entity.Checkin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface CheckinRepository extends MongoRepository<Checkin, String> {
    Optional<Checkin> findByUserIdAndDate(String userId, LocalDate date);
    boolean existsByUserIdAndDate(String userId, LocalDate date);
}
