package com.knowledge.platform.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ReadingProgressRequest {
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码必须大于0")
    private Integer currentPage;

    private List<Integer> bookmarks;

    /**
     * 打开阅读器时获取到的版本号；服务端无记录时为 null。
     * 另一台设备已写入新版本时，携带旧版本号的请求会被判为冲突，不会覆盖。
     */
    private Long expectedVersion;
}
