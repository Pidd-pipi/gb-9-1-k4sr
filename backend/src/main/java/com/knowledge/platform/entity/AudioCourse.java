package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "audio_courses")
public class AudioCourse {
    @Id
    private String id;

    @Indexed
    private String creatorId;

    @TextIndexed(weight = 3)
    private String title;

    @TextIndexed(weight = 2)
    private String description;

    private String cover;

    private BigDecimal price;

    private Integer episodeCount = 0;

    private Integer totalDuration = 0;

    private Boolean isSeries = false;

    private Status status = Status.DRAFT;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Status {
        DRAFT,
        PUBLISHED
    }
}
