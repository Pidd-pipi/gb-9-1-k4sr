package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "points_records")
public class PointsRecord {
    @Id
    private String id;

    @Indexed
    private String userId;

    private Type type;

    private Integer points;

    private String reason;

    private LocalDateTime createdAt;

    public enum Type {
        EARN,
        SPEND
    }
}
