package com.knowledge.platform.controller;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.entity.AudioCourse;
import com.knowledge.platform.entity.AudioEpisode;
import com.knowledge.platform.service.AudioEpisodeService;
import com.knowledge.platform.service.AudioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/audio")
public class AudioController {
    @Autowired
    private AudioService audioService;

    @Autowired
    private AudioEpisodeService audioEpisodeService;

    @GetMapping
    public ApiResponse<Page<AudioCourse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return audioService.list(pageable);
    }

    @GetMapping("/{id}")
    public ApiResponse<AudioCourse> getById(@PathVariable String id) {
        return audioService.getById(id);
    }

    @GetMapping("/{courseId}/episodes")
    public ApiResponse<List<AudioEpisode>> getEpisodes(@PathVariable String courseId) {
        List<AudioEpisode> episodes = audioEpisodeService.getEpisodes(courseId);
        return ApiResponse.success(episodes);
    }

    @GetMapping("/{courseId}/episodes/{episodeId}")
    public ApiResponse<AudioEpisode> getEpisode(
            @PathVariable String courseId,
            @PathVariable String episodeId) {
        Optional<AudioEpisode> episodeOpt = audioEpisodeService.getEpisode(courseId, episodeId);
        if (episodeOpt.isEmpty()) {
            return ApiResponse.error("音频集不存在");
        }
        return ApiResponse.success(episodeOpt.get());
    }
}
