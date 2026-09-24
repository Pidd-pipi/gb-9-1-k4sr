package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "reading_progress")
@CompoundIndex(name = "user_ebook_idx", def = "{'userId': 1, 'ebookId': 1}", unique = true)
public class ReadingProgress {
    @Id
    private String id;

    private String userId;

    private String ebookId;

    private Integer currentPage = 1;

    private Double progressPercent = 0.0;

    private LocalDateTime updatedAt;
}
