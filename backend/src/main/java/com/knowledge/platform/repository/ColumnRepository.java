package com.knowledge.platform.repository;

import com.knowledge.platform.entity.Column;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ColumnRepository extends MongoRepository<Column, String> {
    Page<Column> findByStatus(Column.Status status, Pageable pageable);
    List<Column> findByCreatorId(String creatorId);

    @Query("{'$text': {'$search': ?0}, 'status': 'PUBLISHED'}")
    List<Column> searchByKeyword(String keyword);
}
