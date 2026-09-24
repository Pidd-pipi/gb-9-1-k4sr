package com.knowledge.platform.service;

import com.knowledge.platform.entity.AudioEpisode;
import com.knowledge.platform.repository.AudioEpisodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AudioEpisodeService {
    @Autowired
    private AudioEpisodeRepository audioEpisodeRepository;

    public List<AudioEpisode> getEpisodes(String courseId) {
        return audioEpisodeRepository.findByCourseIdOrderBySequenceAsc(courseId);
    }

    public Optional<AudioEpisode> getEpisode(String courseId, String episodeId) {
        return audioEpisodeRepository.findByCourseIdAndId(courseId, episodeId);
    }
}
