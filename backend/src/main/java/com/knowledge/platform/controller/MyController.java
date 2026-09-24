package com.knowledge.platform.controller;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.SubscribeRequest;
import com.knowledge.platform.entity.Order;
import com.knowledge.platform.entity.Subscription;
import com.knowledge.platform.repository.OrderRepository;
import com.knowledge.platform.security.CurrentUserUtil;
import com.knowledge.platform.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/my")
public class MyController {
    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    @GetMapping("/subscriptions")
    public ApiResponse<Page<Subscription>> mySubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("请先登录");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return subscriptionService.getMySubscriptions(userId, pageable);
    }

    @GetMapping("/orders")
    public ApiResponse<Page<Order>> myOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("请先登录");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponse.success(orderRepository.findByUserId(userId, pageable));
    }
}
