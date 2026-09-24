package com.knowledge.platform.controller;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.ColumnCreateRequest;
import com.knowledge.platform.dto.SubscribeRequest;
import com.knowledge.platform.entity.Article;
import com.knowledge.platform.entity.Column;
import com.knowledge.platform.entity.Subscription;
import com.knowledge.platform.security.CurrentUserUtil;
import com.knowledge.platform.service.ArticleService;
import com.knowledge.platform.service.ColumnService;
import com.knowledge.platform.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/columns")
public class ColumnController {
    @Autowired
    private ColumnService columnService;

    @Autowired
    private ArticleService articleService;

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    @GetMapping
    public ApiResponse<Page<Column>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return columnService.list(pageable);
    }

    @GetMapping("/{id}")
    public ApiResponse<Column> getById(@PathVariable String id) {
        return columnService.getById(id);
    }

    @PostMapping
    public ApiResponse<Column> create(@RequestBody ColumnCreateRequest request) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("请先登录");
        }
        return columnService.create(userId, request);
    }

    @GetMapping("/{id}/articles")
    public ApiResponse<List<Article>> getArticles(@PathVariable String id) {
        List<Article> articles = articleService.getAllArticles(id);
        return ApiResponse.success(articles);
    }

    @GetMapping("/{columnId}/articles/{articleId}")
    public ApiResponse<Article> getArticle(
            @PathVariable String columnId,
            @PathVariable String articleId) {
        Optional<Article> articleOpt = articleService.getArticle(columnId, articleId);
        if (articleOpt.isEmpty()) {
            return ApiResponse.error("文章不存在");
        }
        return ApiResponse.success(articleOpt.get());
    }

    @PostMapping("/{id}/subscribe")
    public ApiResponse<Subscription> subscribe(
            @PathVariable String id,
            @RequestBody SubscribeRequest request) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            return ApiResponse.error("请先登录");
        }
        return subscriptionService.subscribe(userId, id, request);
    }
}
