package com.knowledge.platform.controller;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.ReadingProgressSaveRequest;
import com.knowledge.platform.entity.ReadingProgress;
import com.knowledge.platform.security.CurrentUserUtil;
import com.knowledge.platform.service.ProgressConflictException;
import com.knowledge.platform.service.ReadingProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/ebooks/{ebookId}/reading-progress")
public class ReadingProgressController {
    @Autowired
    private ReadingProgressService readingProgressService;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    /**
     * 打开阅读器时获取上次阅读状态（页码、书签、版本号）。未登录时返回空数据。
     */
    @GetMapping
    public ApiResponse<ReadingProgress> getProgress(@PathVariable String ebookId) {
        String userId = currentUserUtil.getCurrentUserId();
        Optional<ReadingProgress> progress = readingProgressService.getProgress(userId, ebookId);
        return ApiResponse.success(progress.orElse(null));
    }

    /**
     * 翻页或操作书签后保存进度。请求需带上打开时获取的版本号；
     * 当其他设备已写入更新版本时返回 409 并附带最新记录，不覆盖较新数据。
     */
    @PutMapping
    public ResponseEntity<ApiResponse<ReadingProgress>> saveProgress(
            @PathVariable String ebookId,
            @RequestBody ReadingProgressSaveRequest request) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录后再同步阅读进度"));
        }
        try {
            ReadingProgress saved = readingProgressService.saveProgress(userId, ebookId, request);
            return ResponseEntity.ok(ApiResponse.success("阅读进度已保存", saved));
        } catch (ProgressConflictException e) {
            // 冲突时把服务端最新记录返回给客户端，由用户决定是否切换
            ReadingProgress latest = readingProgressService.getProgress(userId, ebookId).orElse(null);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage(), latest));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
