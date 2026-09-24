package com.knowledge.platform.repository;

import com.knowledge.platform.entity.ReadingProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ReadingProgressRepository extends MongoRepository<ReadingProgress, String> {
    Optional<ReadingProgress> findByUserIdAndEbookId(String userId, String ebookId);
}
