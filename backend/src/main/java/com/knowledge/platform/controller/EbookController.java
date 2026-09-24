package com.knowledge.platform.controller;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.entity.Ebook;
import com.knowledge.platform.service.EbookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ebooks")
public class EbookController {
    @Autowired
    private EbookService ebookService;

    @GetMapping
    public ApiResponse<Page<Ebook>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ebookService.list(pageable);
    }

    @GetMapping("/{id}")
    public ApiResponse<Ebook> getById(@PathVariable String id) {
        return ebookService.getById(id);
    }
}
