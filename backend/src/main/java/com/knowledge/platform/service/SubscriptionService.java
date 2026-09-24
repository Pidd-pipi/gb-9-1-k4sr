package com.knowledge.platform.service;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.SubscribeRequest;
import com.knowledge.platform.entity.Column;
import com.knowledge.platform.entity.Subscription;
import com.knowledge.platform.repository.ColumnRepository;
import com.knowledge.platform.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SubscriptionService {
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private ColumnRepository columnRepository;

    @Autowired
    private PointsService pointsService;

    public ApiResponse<Page<Subscription>> getMySubscriptions(String userId, Pageable pageable) {
        Page<Subscription> subscriptions = subscriptionRepository.findByUserId(userId, pageable);
        return ApiResponse.success(subscriptions);
    }

    @Transactional
    public ApiResponse<Subscription> subscribe(String userId, String columnId, SubscribeRequest request) {
        Optional<Column> columnOpt = columnRepository.findById(columnId);
        if (columnOpt.isEmpty()) {
            return ApiResponse.error("专栏不存在");
        }

        Optional<Subscription> existing = subscriptionRepository.findByUserIdAndColumnIdAndStatus(
                userId, columnId, Subscription.Status.ACTIVE
        );
        if (existing.isPresent()) {
            return ApiResponse.error("您已订阅该专栏");
        }

        Subscription.Plan plan = Subscription.Plan.valueOf(request.getPlan().toUpperCase());
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = switch (plan) {
            case MONTHLY -> now.plusMonths(1);
            case QUARTERLY -> now.plusMonths(3);
            case YEARLY -> now.plusYears(1);
        };

        Subscription subscription = new Subscription();
        subscription.setUserId(userId);
        subscription.setColumnId(columnId);
        subscription.setPlan(plan);
        subscription.setStartDate(now);
        subscription.setEndDate(endDate);
        subscription.setStatus(Subscription.Status.ACTIVE);
        subscription.setCreatedAt(now);
        subscription.setUpdatedAt(now);

        subscription = subscriptionRepository.save(subscription);

        Column column = columnOpt.get();
        column.setSubscriberCount(column.getSubscriberCount() + 1);
        columnRepository.save(column);

        return ApiResponse.success("订阅成功", subscription);
    }
}
