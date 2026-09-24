package com.knowledge.platform.repository;

import com.knowledge.platform.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    Page<Subscription> findByUserId(String userId, Pageable pageable);
    List<Subscription> findByUserIdAndStatus(String userId, Subscription.Status status);
    Optional<Subscription> findByUserIdAndColumnIdAndStatus(String userId, String columnId, Subscription.Status status);
    List<Subscription> findByEndDateBeforeAndStatus(LocalDateTime date, Subscription.Status status);
}
