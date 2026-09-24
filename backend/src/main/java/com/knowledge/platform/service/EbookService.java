package com.knowledge.platform.service;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.entity.Ebook;
import com.knowledge.platform.repository.EbookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EbookService {
    @Autowired
    private EbookRepository ebookRepository;

    public ApiResponse<Page<Ebook>> list(Pageable pageable) {
        Page<Ebook> ebooks = ebookRepository.findByStatus(Ebook.Status.PUBLISHED, pageable);
        return ApiResponse.success(ebooks);
    }

    public ApiResponse<Ebook> getById(String id) {
        Optional<Ebook> ebookOpt = ebookRepository.findById(id);
        if (ebookOpt.isEmpty()) {
            return ApiResponse.error("电子书不存在");
        }
        return ApiResponse.success(ebookOpt.get());
    }
}
