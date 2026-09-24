package com.knowledge.platform.repository;

import com.knowledge.platform.entity.AudioEpisode;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AudioEpisodeRepository extends MongoRepository<AudioEpisode, String> {
    List<AudioEpisode> findByCourseIdOrderBySequenceAsc(String courseId);
    Optional<AudioEpisode> findByCourseIdAndId(String courseId, String id);
}
