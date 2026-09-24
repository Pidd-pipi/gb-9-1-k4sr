package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "ebooks")
public class Ebook {
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

    private String fileUrl;

    private String objectKey;

    private FileType fileType;

    private Integer pageCount;

    private Integer wordCount;

    private Double sampleEndPercent = 0.1;

    private Status status = Status.DRAFT;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum FileType {
        PDF,
        EPUB
    }

    public enum Status {
        DRAFT,
        PUBLISHED
    }
}
