package com.knowledge.platform.service;

import com.knowledge.platform.dto.ReadingProgressRequest;
import com.knowledge.platform.entity.Ebook;
import com.knowledge.platform.entity.ReadingProgress;
import com.knowledge.platform.repository.EbookRepository;
import com.knowledge.platform.repository.ReadingProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReadingProgressServiceTest {

    @Mock
    private ReadingProgressRepository progressRepository;
    @Mock
    private EbookRepository ebookRepository;
    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private ReadingProgressService service;

    private Ebook ebook;

    @BeforeEach
    void setUp() {
        ebook = new Ebook();
        ebook.setId("ebook-1");
        ebook.setPageCount(100);
        lenient().when(ebookRepository.findById("ebook-1")).thenReturn(Optional.of(ebook));
    }

    private ReadingProgressRequest request(int page, List<Integer> bookmarks, Long version) {
        ReadingProgressRequest req = new ReadingProgressRequest();
        req.setCurrentPage(page);
        req.setBookmarks(bookmarks);
        req.setExpectedVersion(version);
        return req;
    }

    @Test
    void saveWithMatchingVersionUpdatesAndReturnsSaved() {
        ReadingProgress updated = new ReadingProgress();
        updated.setCurrentPage(50);
        updated.setVersion(2L);
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), eq(ReadingProgress.class))).thenReturn(updated);

        var result = service.save("user-1", "ebook-1", request(50, List.of(10), 1L));

        assertEquals(ReadingProgressService.SaveStatus.SAVED, result.status());
        assertEquals(2L, result.progress().getVersion());
        assertEquals(50, result.progress().getCurrentPage());
    }

    @Test
    void saveWithStaleVersionReturnsConflictAndDoesNotOverwrite() {
        // 条件更新匹配 0 行：说明另一台设备已写入更新版本
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), eq(ReadingProgress.class))).thenReturn(null);
        ReadingProgress latest = new ReadingProgress();
        latest.setCurrentPage(80);
        latest.setVersion(3L);
        when(progressRepository.findByUserIdAndEbookId("user-1", "ebook-1"))
                .thenReturn(Optional.of(latest));

        var result = service.save("user-1", "ebook-1", request(50, List.of(), 1L));

        assertEquals(ReadingProgressService.SaveStatus.CONFLICT, result.status());
        assertEquals(3L, result.progress().getVersion());
        assertEquals(80, result.progress().getCurrentPage());
    }

    @Test
    void firstSaveWithNoRecordInsertsVersionOne() {
        // 没有历史文档：findAndModify 返回 null，随后走 save 插入
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), eq(ReadingProgress.class))).thenReturn(null);
        when(progressRepository.save(any(ReadingProgress.class))).thenAnswer(inv -> {
            ReadingProgress p = inv.getArgument(0);
            p.setId("new-id");
            return p;
        });

        var result = service.save("user-1", "ebook-1", request(5, List.of(5), null));

        assertEquals(ReadingProgressService.SaveStatus.SAVED, result.status());
        assertEquals(1L, result.progress().getVersion());
        assertEquals(5, result.progress().getCurrentPage());
        verify(progressRepository).save(any(ReadingProgress.class));
    }

    @Test
    void concurrentFirstSaveHittingDuplicateKeyReturnsConflict() {
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), eq(ReadingProgress.class)))
                .thenReturn(null);
        when(progressRepository.save(any(ReadingProgress.class)))
                .thenThrow(new DuplicateKeyException("duplicate"));
        ReadingProgress latest = new ReadingProgress();
        latest.setCurrentPage(20);
        latest.setVersion(1L);
        when(progressRepository.findByUserIdAndEbookId("user-1", "ebook-1"))
                .thenReturn(Optional.of(latest));

        var result = service.save("user-1", "ebook-1", request(10, List.of(), null));

        assertEquals(ReadingProgressService.SaveStatus.CONFLICT, result.status());
        assertEquals(20, result.progress().getCurrentPage());
    }

    @Test
    void pageBeyondPageCountIsRejectedAndRecordUntouched() {
        var ex = assertThrows(IllegalArgumentException.class,
                () -> service.save("user-1", "ebook-1", request(101, List.of(), 1L)));
        assertEquals("页码超出总页数", ex.getMessage());
        verify(mongoTemplate, never()).findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), any());
    }

    @Test
    void bookmarkBeyondPageCountIsRejected() {
        var ex = assertThrows(IllegalArgumentException.class,
                () -> service.save("user-1", "ebook-1", request(10, List.of(150), 1L)));
        assertEquals("书签页码超出总页数", ex.getMessage());
        verify(mongoTemplate, never()).findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), any());
    }

    @Test
    void missingEbookIsRejected() {
        when(ebookRepository.findById("missing")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class,
                () -> service.save("user-1", "missing", request(1, List.of(), null)));
    }

    @Test
    void firstSaveWithNullVersionMigratesLegacyDocument() {
        // 升级前的历史文档没有 version 字段，null 版本号的更新应能匹配并补上版本号
        ReadingProgress migrated = new ReadingProgress();
        migrated.setCurrentPage(30);
        migrated.setVersion(1L);
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), eq(ReadingProgress.class))).thenReturn(migrated);

        var result = service.save("user-1", "ebook-1", request(30, List.of(), null));

        assertEquals(ReadingProgressService.SaveStatus.SAVED, result.status());
        assertEquals(1L, result.progress().getVersion());
        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).findAndModify(queryCaptor.capture(), any(Update.class),
                any(FindAndModifyOptions.class), eq(ReadingProgress.class));
        assertTrue(queryCaptor.getValue().getQueryObject().containsKey("version"));
        assertNull(queryCaptor.getValue().getQueryObject().get("version"));
    }

    @Test
    void duplicateBookmarksAreDeduplicated() {
        ReadingProgress saved = new ReadingProgress();
        saved.setVersion(1L);
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), eq(ReadingProgress.class))).thenReturn(saved);

        service.save("user-1", "ebook-1", request(10, List.of(10, 10, 20, 20), null));

        ArgumentCaptor<Update> captor = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate).findAndModify(any(Query.class), captor.capture(),
                any(FindAndModifyOptions.class), eq(ReadingProgress.class));
        // bookmarks 字段已去重并保序
        Object setClause = captor.getValue().getUpdateObject().get("$set");
        assertNotNull(setClause);
        assertTrue(setClause.toString().contains("bookmarks=[10, 20]"), setClause.toString());
    }
}
