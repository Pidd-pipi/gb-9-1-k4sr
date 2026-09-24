package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "columns")
public class Column {
    @Id
    private String id;

    @Indexed
    private String creatorId;

    @TextIndexed(weight = 3)
    private String title;

    @TextIndexed(weight = 2)
    private String description;

    private String cover;

    private String category;

    private BigDecimal monthlyPrice;

    private BigDecimal quarterlyPrice;

    private BigDecimal yearlyPrice;

    private Integer articleCount = 0;

    private Integer subscriberCount = 0;

    private Status status = Status.DRAFT;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Status {
        DRAFT,
        PUBLISHED
    }
}
