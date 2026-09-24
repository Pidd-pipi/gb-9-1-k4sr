package com.knowledge.platform.service;

import com.knowledge.platform.dto.ReadingProgressSaveRequest;
import com.knowledge.platform.entity.Ebook;
import com.knowledge.platform.entity.ReadingProgress;
import com.knowledge.platform.repository.EbookRepository;
import com.knowledge.platform.repository.ReadingProgressRepository;
import com.mongodb.client.result.UpdateResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
    private ReadingProgressRepository readingProgressRepository;

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

    private ReadingProgressSaveRequest request(int page, List<Integer> bookmarks, long version) {
        ReadingProgressSaveRequest req = new ReadingProgressSaveRequest();
        req.setCurrentPage(page);
        req.setBookmarks(bookmarks);
        req.setVersion(version);
        return req;
    }

    @Test
    void shouldRejectWhenNotLoggedIn() {
        assertThrows(IllegalArgumentException.class,
                () -> service.saveProgress(null, "ebook-1", request(2, List.of(), 0)));
        verifyNoInteractions(readingProgressRepository);
    }

    @Test
    void shouldRejectWhenEbookMissing() {
        when(ebookRepository.findById("missing")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class,
                () -> service.saveProgress("user-1", "missing", request(2, List.of(), 0)));
    }

    @Test
    void shouldRejectWhenPageExceedsTotalPagesAndKeepRecord() {
        assertThrows(IllegalArgumentException.class,
                () -> service.saveProgress("user-1", "ebook-1",
                        request(101, List.of(5), 0)));
        verify(readingProgressRepository, never()).save(any());
        verify(mongoTemplate, never()).updateFirst(any(Query.class), any(Update.class), eq(ReadingProgress.class));
    }

    @Test
    void shouldRejectWhenBookmarkExceedsTotalPages() {
        assertThrows(IllegalArgumentException.class,
                () -> service.saveProgress("user-1", "ebook-1",
                        request(10, List.of(200), 0)));
        verify(readingProgressRepository, never()).save(any());
    }

    @Test
    void shouldRejectPageBelowOne() {
        assertThrows(IllegalArgumentException.class,
                () -> service.saveProgress("user-1", "ebook-1",
                        request(0, List.of(), 0)));
    }

    @Test
    void shouldCreateRecordWithVersionOneWhenAbsentAndVersionZero() {
        when(readingProgressRepository.findByUserIdAndEbookId("user-1", "ebook-1"))
                .thenReturn(Optional.empty());
        when(readingProgressRepository.save(any(ReadingProgress.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        ReadingProgress saved = service.saveProgress("user-1", "ebook-1",
                request(5, List.of(2, 8), 0));

        assertEquals(1L, saved.getVersion());
        assertEquals(5, saved.getCurrentPage());
        assertEquals(List.of(2, 8), saved.getBookmarks());
        assertNotNull(saved.getUpdatedAt());
    }

    @Test
    void shouldConflictWhenRecordAbsentButClientVersionIsNewer() {
        when(readingProgressRepository.findByUserIdAndEbookId("user-1", "ebook-1"))
                .thenReturn(Optional.empty());
        assertThrows(ProgressConflictException.class,
                () -> service.saveProgress("user-1", "ebook-1",
                        request(5, List.of(), 3)));
        verify(readingProgressRepository, never()).save(any());
    }

    @Test
    void shouldUpdateWhenVersionMatches() {
        ReadingProgress existing = new ReadingProgress();
        existing.setVersion(2L);
        ReadingProgress updated = new ReadingProgress();
        updated.setVersion(3L);
        updated.setCurrentPage(20);
        when(readingProgressRepository.findByUserIdAndEbookId("user-1", "ebook-1"))
                .thenReturn(Optional.of(existing))
                .thenReturn(Optional.of(updated));
        when(mongoTemplate.updateFirst(any(Query.class), any(Update.class), eq(ReadingProgress.class)))
                .thenReturn(UpdateResult.acknowledged(1, 1L, null));

        ReadingProgress result = service.saveProgress("user-1", "ebook-1",
                request(20, List.of(), 2));

        assertEquals(3L, result.getVersion());
        assertEquals(20, result.getCurrentPage());
    }

    @Test
    void shouldConflictWhenVersionDoesNotMatchAndNotOverwrite() {
        ReadingProgress existing = new ReadingProgress();
        existing.setVersion(5L); // 另一台设备已写入版本 5
        when(readingProgressRepository.findByUserIdAndEbookId("user-1", "ebook-1"))
                .thenReturn(Optional.of(existing));
        when(mongoTemplate.updateFirst(any(Query.class), any(Update.class), eq(ReadingProgress.class)))
                .thenReturn(UpdateResult.acknowledged(0, 0L, null));

        assertThrows(ProgressConflictException.class,
                () -> service.saveProgress("user-1", "ebook-1",
                        request(10, List.of(), 2))); // 旧请求携带版本 2
    }

    @Test
    void shouldDeduplicateAndSortBookmarks() {
        when(readingProgressRepository.findByUserIdAndEbookId("user-1", "ebook-1"))
                .thenReturn(Optional.empty());
        ArgumentCaptor<ReadingProgress> captor = ArgumentCaptor.forClass(ReadingProgress.class);
        when(readingProgressRepository.save(captor.capture()))
                .thenAnswer(inv -> inv.getArgument(0));

        service.saveProgress("user-1", "ebook-1",
                request(5, List.of(9, 3, 9, 1), 0));

        assertEquals(List.of(1, 3, 9), captor.getValue().getBookmarks());
    }

    @Test
    void shouldCalculateProgressPercent() {
        when(readingProgressRepository.findByUserIdAndEbookId("user-1", "ebook-1"))
                .thenReturn(Optional.empty());
        ArgumentCaptor<ReadingProgress> captor = ArgumentCaptor.forClass(ReadingProgress.class);
        when(readingProgressRepository.save(captor.capture()))
                .thenAnswer(inv -> inv.getArgument(0));

        service.saveProgress("user-1", "ebook-1",
                request(25, List.of(), 0));

        assertEquals(25.0, captor.getValue().getProgressPercent());
    }
}
