package com.knowledge.platform.repository;

import com.knowledge.platform.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {
    Page<Order> findByUserId(String userId, Pageable pageable);
    Optional<Order> findByOrderNo(String orderNo);
    Optional<Order> findByIdAndUserId(String id, String userId);
}
