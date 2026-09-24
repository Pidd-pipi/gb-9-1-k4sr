package com.knowledge.platform.service;

import com.knowledge.platform.entity.Article;
import com.knowledge.platform.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArticleService {
    @Autowired
    private ArticleRepository articleRepository;

    public Page<Article> getArticles(String columnId, Pageable pageable) {
        return articleRepository.findByColumnId(columnId, pageable);
    }

    public List<Article> getAllArticles(String columnId) {
        return articleRepository.findByColumnIdOrderBySequenceAsc(columnId);
    }

    public Optional<Article> getArticle(String columnId, String articleId) {
        return articleRepository.findByColumnIdAndId(columnId, articleId);
    }
}
