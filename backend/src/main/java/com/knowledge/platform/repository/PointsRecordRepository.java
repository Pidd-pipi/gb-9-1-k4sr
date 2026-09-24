package com.knowledge.platform.repository;

import com.knowledge.platform.entity.PointsRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PointsRecordRepository extends MongoRepository<PointsRecord, String> {
    Page<PointsRecord> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
}
