package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "audio_episodes")
public class AudioEpisode {
    @Id
    private String id;

    @Indexed
    private String courseId;

    private String title;

    private String description;

    private Integer duration;

    private String fileUrl;

    private String objectKey;

    private Integer sequence;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
