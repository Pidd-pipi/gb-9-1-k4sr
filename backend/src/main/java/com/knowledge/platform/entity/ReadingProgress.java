package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "reading_progress")
@CompoundIndex(name = "user_ebook_idx", def = "{'userId': 1, 'ebookId': 1}", unique = true)
public class ReadingProgress {
    @Id
    private String id;

    private String userId;

    private String ebookId;

    private Integer currentPage = 1;

    private List<Integer> bookmarks = new ArrayList<>();

    private Double progressPercent = 0.0;

    /**
     * 乐观锁版本号，每次保存成功后递增。
     * 保存请求必须携带打开时获取到的版本号，服务端据此拒绝旧请求覆盖新版本。
     */
    private Long version;

    private LocalDateTime updatedAt;
}
