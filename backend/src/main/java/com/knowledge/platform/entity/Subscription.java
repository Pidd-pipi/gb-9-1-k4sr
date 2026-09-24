package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "subscriptions")
public class Subscription {
    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String columnId;

    private Plan plan;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Status status = Status.ACTIVE;

    private String orderId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Plan {
        MONTHLY,
        QUARTERLY,
        YEARLY
    }

    public enum Status {
        ACTIVE,
        EXPIRED
    }
}
