package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "points")
public class PointsAccount {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private Integer balance = 0;

    private Integer totalEarned = 0;

    private Integer totalSpent = 0;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
