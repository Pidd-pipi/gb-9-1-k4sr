package com.knowledge.platform.controller;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.CreatorApplyRequest;
import com.knowledge.platform.entity.Creator;
import com.knowledge.platform.security.CurrentUserUtil;
import com.knowledge.platform.service.CreatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/creators")
public class CreatorController {
    @Autowired
    private CreatorService creatorService;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    @PostMapping("/apply")
    public ApiResponse<Creator> apply(@RequestBody CreatorApplyRequest request) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("请先登录");
        }
        return creatorService.apply(userId, request);
    }

    @GetMapping("/{id}")
    public ApiResponse<Creator> getById(@PathVariable String id) {
        return creatorService.getById(id);
    }

    @GetMapping("/me")
    public ApiResponse<Creator> getMyProfile() {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("请先登录");
        }
        return creatorService.getByUserId(userId);
    }
}
