package com.knowledge.platform.repository;

import com.knowledge.platform.entity.PointsAccount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PointsAccountRepository extends MongoRepository<PointsAccount, String> {
    Optional<PointsAccount> findByUserId(String userId);
    boolean existsByUserId(String userId);
}
