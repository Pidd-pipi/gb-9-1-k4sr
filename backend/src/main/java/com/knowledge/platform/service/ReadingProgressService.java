package com.knowledge.platform.service;

import com.knowledge.platform.dto.ReadingProgressSaveRequest;
import com.knowledge.platform.entity.Ebook;
import com.knowledge.platform.entity.ReadingProgress;
import com.knowledge.platform.repository.EbookRepository;
import com.knowledge.platform.repository.ReadingProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import com.mongodb.client.result.UpdateResult;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReadingProgressService {
    @Autowired
    private ReadingProgressRepository readingProgressRepository;

    @Autowired
    private EbookRepository ebookRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * 获取某用户在某本书上的阅读进度，未登录或没有记录时返回 empty。
     */
    public Optional<ReadingProgress> getProgress(String userId, String ebookId) {
        if (userId == null) {
            return Optional.empty();
        }
        return readingProgressRepository.findByUserIdAndEbookId(userId, ebookId);
    }

    /**
     * 基于版本号的乐观锁保存。
     * 校验不通过（电子书不存在、页码超出范围等）或版本冲突时不做任何写入，原记录保持不变。
     */
    public ReadingProgress saveProgress(String userId, String ebookId, ReadingProgressSaveRequest request) {
        if (userId == null) {
            throw new IllegalArgumentException("请先登录后再保存阅读进度");
        }

        Ebook ebook = ebookRepository.findById(ebookId)
                .orElseThrow(() -> new IllegalArgumentException("电子书不存在"));

        if (request == null || request.getCurrentPage() == null) {
            throw new IllegalArgumentException("页码不能为空");
        }
        int page = request.getCurrentPage();
        int totalPages = ebook.getPageCount() != null ? ebook.getPageCount() : 0;
        if (page < 1 || (totalPages > 0 && page > totalPages)) {
            throw new IllegalArgumentException("页码超出总页数，保存失败");
        }

        List<Integer> bookmarks = request.getBookmarks() == null
                ? List.of()
                : request.getBookmarks().stream().sorted().distinct().toList();
        for (Integer bookmark : bookmarks) {
            if (bookmark == null || bookmark < 1 || (totalPages > 0 && bookmark > totalPages)) {
                throw new IllegalArgumentException("书签页码超出总页数，保存失败");
            }
        }

        long expectedVersion = request.getVersion() == null ? 0L : request.getVersion();
        if (expectedVersion < 0) {
            throw new IllegalArgumentException("版本号不合法");
        }

        double percent = totalPages > 0
                ? Math.round(page * 1000.0 / totalPages) / 10.0
                : 0.0;
        LocalDateTime now = LocalDateTime.now();

        Optional<ReadingProgress> existing =
                readingProgressRepository.findByUserIdAndEbookId(userId, ebookId);

        if (existing.isEmpty()) {
            if (expectedVersion != 0) {
                // 记录不存在，任何大于 0 的版本号都说明客户端拿到的是过期视图
                throw new ProgressConflictException("阅读进度已在其他设备更新，请刷新后再试");
            }
            ReadingProgress progress = new ReadingProgress();
            progress.setUserId(userId);
            progress.setEbookId(ebookId);
            progress.setCurrentPage(page);
            progress.setBookmarks(bookmarks);
            progress.setProgressPercent(percent);
            progress.setVersion(1L);
            progress.setUpdatedAt(now);
            try {
                return readingProgressRepository.save(progress);
            } catch (DuplicateKeyException e) {
                // 并发情况下另一台设备刚创建了记录，按冲突处理，不能覆盖
                throw new ProgressConflictException("阅读进度已在其他设备更新，请刷新后再试");
            }
        }

        // 原子条件更新：仅当版本号与客户端打开时拿到的版本一致时才写入并递增版本。
        // version=0 同时兼容历史版本中没有 version 字段（null）的记录。
        Criteria criteria = Criteria.where("userId").is(userId)
                .and("ebookId").is(ebookId);
        if (expectedVersion == 0) {
            criteria.and("version").in(0L, null);
        } else {
            criteria.and("version").is(expectedVersion);
        }
        Query query = Query.query(criteria);
        Update update = new Update()
                .set("currentPage", page)
                .set("bookmarks", bookmarks)
                .set("progressPercent", percent)
                .set("updatedAt", now)
                .inc("version", 1L);

        UpdateResult result = mongoTemplate.updateFirst(query, update, ReadingProgress.class);
        if (result.getMatchedCount() == 0) {
            // 另一台设备已经写入新版本，旧请求拒绝覆盖
            throw new ProgressConflictException("阅读进度已在其他设备更新，请刷新后再试");
        }
        return readingProgressRepository.findByUserIdAndEbookId(userId, ebookId).orElseThrow();
    }
}
