package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "creators")
public class Creator {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String username;

    private String avatar;

    private String bio;

    private List<String> expertise;

    private String socialLinks;

    private Status status = Status.PENDING;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }
}
