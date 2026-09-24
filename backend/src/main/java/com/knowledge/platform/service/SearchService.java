package com.knowledge.platform.service;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.entity.*;
import com.knowledge.platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SearchService {
    @Autowired
    private ColumnRepository columnRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private AudioCourseRepository audioCourseRepository;

    @Autowired
    private EbookRepository ebookRepository;

    public ApiResponse<List<SearchResult>> search(String keyword) {
        List<SearchResult> results = new ArrayList<>();

        List<Column> columns = columnRepository.searchByKeyword(keyword);
        for (Column column : columns) {
            results.add(new SearchResult(
                    "COLUMN",
                    column.getId(),
                    column.getTitle(),
                    column.getDescription(),
                    0
            ));
        }

        List<Article> articles = articleRepository.searchByKeyword(keyword);
        for (Article article : articles) {
            results.add(new SearchResult(
                    "ARTICLE",
                    article.getId(),
                    article.getTitle(),
                    article.getSummary(),
                    0
            ));
        }

        List<AudioCourse> audioCourses = audioCourseRepository.searchByKeyword(keyword);
        for (AudioCourse course : audioCourses) {
            results.add(new SearchResult(
                    "AUDIO",
                    course.getId(),
                    course.getTitle(),
                    course.getDescription(),
                    0
            ));
        }

        List<Ebook> ebooks = ebookRepository.searchByKeyword(keyword);
        for (Ebook ebook : ebooks) {
            results.add(new SearchResult(
                    "EBOOK",
                    ebook.getId(),
                    ebook.getTitle(),
                    ebook.getDescription(),
                    0
            ));
        }

        return ApiResponse.success(results);
    }

    public static class SearchResult {
        private String type;
        private String id;
        private String title;
        private String summary;
        private int score;

        public SearchResult() {}

        public SearchResult(String type, String id, String title, String summary, int score) {
            this.type = type;
            this.id = id;
            this.title = title;
            this.summary = summary;
            this.score = score;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
    }
}
