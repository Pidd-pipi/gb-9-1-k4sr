package com.knowledge.platform.service;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.LoginRequest;
import com.knowledge.platform.dto.LoginResponse;
import com.knowledge.platform.dto.RegisterRequest;
import com.knowledge.platform.entity.PointsAccount;
import com.knowledge.platform.entity.User;
import com.knowledge.platform.repository.UserRepository;
import com.knowledge.platform.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PointsService pointsService;

    @Transactional
    public ApiResponse<LoginResponse> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("邮箱已被注册");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return ApiResponse.error("用户名已被使用");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        pointsService.getOrCreateAccount(user.getId());

        String token = tokenProvider.generateToken(user.getId(), user.getRole().name());
        LoginResponse response = new LoginResponse(token, toUserResponse(user));

        return ApiResponse.success(response);
    }

    public ApiResponse<LoginResponse> login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ApiResponse.error("邮箱或密码错误");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ApiResponse.error("邮箱或密码错误");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getRole().name());
        LoginResponse response = new LoginResponse(token, toUserResponse(user));

        return ApiResponse.success(response);
    }

    public ApiResponse<UserResponse> getCurrentUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("用户不存在");
        }
        return ApiResponse.success(toUserResponse(userOpt.get()));
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setAvatar(user.getAvatar());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    public static class UserResponse {
        private String id;
        private String username;
        private String email;
        private String role;
        private String avatar;
        private LocalDateTime createdAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
