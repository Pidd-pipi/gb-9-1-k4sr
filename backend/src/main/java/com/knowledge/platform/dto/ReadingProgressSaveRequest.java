package com.knowledge.platform.dto;

import lombok.Data;

import java.util.List;

/**
 * 保存阅读进度请求。
 * version 为打开阅读器时获取到的版本号（没有记录时为 0），
 * 服务端发现记录已被其他设备更新到更新版本时返回冲突，不会覆盖较新的页码和书签。
 */
@Data
public class ReadingProgressSaveRequest {
    private Integer currentPage;

    private List<Integer> bookmarks;

    private Long version;
}
