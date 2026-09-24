package com.knowledge.platform.repository;

import com.knowledge.platform.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends MongoRepository<Article, String> {
    Page<Article> findByColumnId(String columnId, Pageable pageable);
    List<Article> findByColumnIdOrderBySequenceAsc(String columnId);
    Optional<Article> findByColumnIdAndId(String columnId, String id);

    @Query("{'$text': {'$search': ?0}}")
    List<Article> searchByKeyword(String keyword);
}
