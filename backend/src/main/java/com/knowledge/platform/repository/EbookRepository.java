package com.knowledge.platform.repository;

import com.knowledge.platform.entity.Ebook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface EbookRepository extends MongoRepository<Ebook, String> {
    Page<Ebook> findByStatus(Ebook.Status status, Pageable pageable);
    List<Ebook> findByCreatorId(String creatorId);

    @Query("{'$text': {'$search': ?0}, 'status': 'PUBLISHED'}")
    List<Ebook> searchByKeyword(String keyword);
}
