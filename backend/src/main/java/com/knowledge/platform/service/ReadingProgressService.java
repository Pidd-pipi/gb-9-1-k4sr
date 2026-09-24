package com.knowledge.platform.service;

import com.knowledge.platform.dto.ReadingProgressRequest;
import com.knowledge.platform.entity.Ebook;
import com.knowledge.platform.entity.ReadingProgress;
import com.knowledge.platform.repository.EbookRepository;
import com.knowledge.platform.repository.ReadingProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReadingProgressService {

    public enum SaveStatus {
        SAVED,
        CONFLICT
    }

    public record SaveResult(SaveStatus status, ReadingProgress progress) {
    }

    @Autowired
    private ReadingProgressRepository progressRepository;

    @Autowired
    private EbookRepository ebookRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Optional<ReadingProgress> get(String userId, String ebookId) {
        return progressRepository.findByUserIdAndEbookId(userId, ebookId);
    }

    /**
     * 按版本号保存页码与书签。
     * 校验失败（电子书不存在、页码超出总页数、书签非法）时不会改动原记录，由上层返回错误。
     * 已存在同 (userId, ebookId) 的记录但版本号不匹配时返回 CONFLICT，并带回服务端最新记录。
     */
    public SaveResult save(String userId, String ebookId, ReadingProgressRequest request) {
        Optional<Ebook> ebookOpt = ebookRepository.findById(ebookId);
        if (ebookOpt.isEmpty()) {
            throw new IllegalArgumentException("电子书不存在");
        }
        Ebook ebook = ebookOpt.get();

        int currentPage = request.getCurrentPage();
        Integer pageCount = ebook.getPageCount();
        if (pageCount != null && pageCount > 0 && currentPage > pageCount) {
            throw new IllegalArgumentException("页码超出总页数");
        }

        List<Integer> bookmarks = sanitizeBookmarks(request.getBookmarks(), pageCount);

        double progressPercent = 0.0;
        if (pageCount != null && pageCount > 0) {
            progressPercent = Math.round(currentPage * 10000.0 / pageCount) / 100.0;
        }
        LocalDateTime now = LocalDateTime.now();
        Long expectedVersion = request.getExpectedVersion();

        // 已打开过（拿到过版本号）：只允许在版本号一致的记录上更新，保证旧请求不覆盖新版本
        if (expectedVersion != null) {
            Query query = new Query(
                    Criteria.where("userId").is(userId)
                            .and("ebookId").is(ebookId)
                            .and("version").is(expectedVersion)
            );
            Update update = new Update()
                    .set("currentPage", currentPage)
                    .set("bookmarks", bookmarks)
                    .set("progressPercent", progressPercent)
                    .set("updatedAt", now)
                    .inc("version", 1L);
            ReadingProgress updated = mongoTemplate.findAndModify(
                    query, update, FindAndModifyOptions.options().returnNew(true), ReadingProgress.class);
            if (updated != null) {
                return new SaveResult(SaveStatus.SAVED, updated);
            }
            ReadingProgress latest = progressRepository.findByUserIdAndEbookId(userId, ebookId)
                    .orElse(null);
            return new SaveResult(SaveStatus.CONFLICT, latest);
        }

        // 首次保存（打开时无版本号），分两种情况，均为原子操作：
        // 1) 升级前的历史记录没有 version 字段（version 为 null）：补写内容并把版本号初始化为 1
        // 2) 完全没有记录：插入一条新记录，版本号从 1 开始
        Query legacyQuery = new Query(
                Criteria.where("userId").is(userId)
                        .and("ebookId").is(ebookId)
                        .and("version").is(null)
        );
        Update legacyUpdate = new Update()
                .set("currentPage", currentPage)
                .set("bookmarks", bookmarks)
                .set("progressPercent", progressPercent)
                .set("updatedAt", now)
                .set("version", 1L);
        ReadingProgress migrated = mongoTemplate.findAndModify(
                legacyQuery, legacyUpdate,
                FindAndModifyOptions.options().returnNew(true), ReadingProgress.class);
        if (migrated != null) {
            return new SaveResult(SaveStatus.SAVED, migrated);
        }

        ReadingProgress progress = new ReadingProgress();
        progress.setUserId(userId);
        progress.setEbookId(ebookId);
        progress.setCurrentPage(currentPage);
        progress.setBookmarks(bookmarks);
        progress.setProgressPercent(progressPercent);
        progress.setVersion(1L);
        progress.setUpdatedAt(now);
        try {
            return new SaveResult(SaveStatus.SAVED, progressRepository.save(progress));
        } catch (DuplicateKeyException e) {
            // 并发首存：另一台设备已抢先写入，按冲突处理，不能覆盖
            return new SaveResult(SaveStatus.CONFLICT,
                    progressRepository.findByUserIdAndEbookId(userId, ebookId).orElse(null));
        }
    }

    private List<Integer> sanitizeBookmarks(List<Integer> raw, Integer pageCount) {
        List<Integer> result = new ArrayList<>();
        if (raw == null) {
            return result;
        }
        for (Integer page : raw) {
            if (page == null || page < 1) {
                throw new IllegalArgumentException("书签页码非法");
            }
            if (pageCount != null && pageCount > 0 && page > pageCount) {
                throw new IllegalArgumentException("书签页码超出总页数");
            }
            if (!result.contains(page)) {
                result.add(page);
            }
        }
        return result;
    }
}
