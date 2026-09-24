package com.knowledge.platform.repository;

import com.knowledge.platform.entity.AudioCourse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface AudioCourseRepository extends MongoRepository<AudioCourse, String> {
    Page<AudioCourse> findByStatus(AudioCourse.Status status, Pageable pageable);
    List<AudioCourse> findByCreatorId(String creatorId);

    @Query("{'$text': {'$search': ?0}, 'status': 'PUBLISHED'}")
    List<AudioCourse> searchByKeyword(String keyword);
}
