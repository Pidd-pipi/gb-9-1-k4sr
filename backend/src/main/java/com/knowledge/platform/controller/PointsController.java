package com.knowledge.platform.controller;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.entity.Checkin;
import com.knowledge.platform.entity.PointsAccount;
import com.knowledge.platform.entity.PointsRecord;
import com.knowledge.platform.repository.PointsRecordRepository;
import com.knowledge.platform.security.CurrentUserUtil;
import com.knowledge.platform.service.CheckinService;
import com.knowledge.platform.service.PointsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/points")
public class PointsController {
    @Autowired
    private PointsService pointsService;

    @Autowired
    private CheckinService checkinService;

    @Autowired
    private PointsRecordRepository pointsRecordRepository;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    @GetMapping("/balance")
    public ApiResponse<PointsAccount> getBalance() {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("请先登录");
        }
        return ApiResponse.success(pointsService.getAccount(userId));
    }

    @GetMapping("/records")
    public ApiResponse<Page<PointsRecord>> getRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("请先登录");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponse.success(pointsRecordRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable));
    }

    @PostMapping("/checkin")
    public ApiResponse<Checkin> checkin() {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("请先登录");
        }
        return checkinService.checkin(userId);
    }
}
