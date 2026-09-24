package com.knowledge.platform.dto;

import com.knowledge.platform.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private AuthService.UserResponse user;
}
