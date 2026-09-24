package com.knowledge.platform.repository;

import com.knowledge.platform.entity.Creator;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CreatorRepository extends MongoRepository<Creator, String> {
    Optional<Creator> findByUserId(String userId);
    Optional<Creator> findById(String id);
    boolean existsByUserId(String userId);
}
