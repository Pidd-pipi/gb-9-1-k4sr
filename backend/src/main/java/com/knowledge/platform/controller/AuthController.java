package com.knowledge.platform.controller;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.LoginRequest;
import com.knowledge.platform.dto.LoginResponse;
import com.knowledge.platform.dto.RegisterRequest;
import com.knowledge.platform.security.CurrentUserUtil;
import com.knowledge.platform.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public ApiResponse<AuthService.UserResponse> getCurrentUser() {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("未登录");
        }
        return authService.getCurrentUser(userId);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.success("已退出登录", null);
    }
}
