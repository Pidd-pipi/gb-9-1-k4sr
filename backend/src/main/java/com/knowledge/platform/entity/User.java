package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String avatar;

    private Role role = Role.USER;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Role {
        USER,
        CREATOR,
        ADMIN
    }
}
