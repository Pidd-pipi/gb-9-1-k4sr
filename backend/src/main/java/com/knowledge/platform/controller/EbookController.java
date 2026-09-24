package com.knowledge.platform.controller;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.ReadingProgressRequest;
import com.knowledge.platform.entity.Ebook;
import com.knowledge.platform.entity.ReadingProgress;
import com.knowledge.platform.security.CurrentUserUtil;
import com.knowledge.platform.service.EbookService;
import com.knowledge.platform.service.ReadingProgressService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ebooks")
public class EbookController {
    @Autowired
    private EbookService ebookService;

    @Autowired
    private ReadingProgressService readingProgressService;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    @GetMapping
    public ApiResponse<Page<Ebook>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ebookService.list(pageable);
    }

    @GetMapping("/{id}")
    public ApiResponse<Ebook> getById(@PathVariable String id) {
        return ebookService.getById(id);
    }

    /**
     * 获取当前账号在该书的阅读进度（页码、书签、版本号）。
     * 未登录或尚无记录时 data 为 null，阅读器从第一页开始。
     */
    @GetMapping("/{id}/progress")
    public ApiResponse<ReadingProgress> getProgress(@PathVariable String id) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("未登录", null);
        }
        return ApiResponse.success(readingProgressService.get(userId, id).orElse(null));
    }

    /**
     * 保存阅读进度。携带打开时的版本号做乐观锁：
     * 另一台设备已写入新版本时返回 409，并在 data 中给出服务端最新进度，旧内容不覆盖。
     * 未登录、页码非法等错误情况下服务端保留原记录。
     */
    @PutMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<ReadingProgress>> saveProgress(
            @PathVariable String id,
            @Valid @RequestBody ReadingProgressRequest request) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录后再同步阅读进度"));
        }
        try {
            ReadingProgressService.SaveResult result = readingProgressService.save(userId, id, request);
            if (result.status() == ReadingProgressService.SaveStatus.CONFLICT) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("阅读进度已在其他设备更新，请刷新后重试", result.progress()));
            }
            return ResponseEntity.ok(ApiResponse.success("保存成功", result.progress()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
