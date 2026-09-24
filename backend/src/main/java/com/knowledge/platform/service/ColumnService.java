package com.knowledge.platform.service;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.ColumnCreateRequest;
import com.knowledge.platform.entity.Column;
import com.knowledge.platform.repository.ColumnRepository;
import com.knowledge.platform.repository.CreatorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ColumnService {
    @Autowired
    private ColumnRepository columnRepository;

    @Autowired
    private CreatorRepository creatorRepository;

    public ApiResponse<Page<Column>> list(Pageable pageable) {
        Page<Column> columns = columnRepository.findByStatus(Column.Status.PUBLISHED, pageable);
        return ApiResponse.success(columns);
    }

    public ApiResponse<Column> getById(String id) {
        Optional<Column> columnOpt = columnRepository.findById(id);
        if (columnOpt.isEmpty()) {
            return ApiResponse.error("专栏不存在");
        }
        return ApiResponse.success(columnOpt.get());
    }

    @Transactional
    public ApiResponse<Column> create(String userId, ColumnCreateRequest request) {
        boolean isCreator = creatorRepository.existsByUserId(userId);
        if (!isCreator) {
            return ApiResponse.error("只有创作者可以发布专栏");
        }

        Column column = new Column();
        column.setCreatorId(userId);
        column.setTitle(request.getTitle());
        column.setDescription(request.getDescription());
        column.setCategory(request.getCategory());
        column.setMonthlyPrice(request.getMonthlyPrice());
        column.setQuarterlyPrice(request.getQuarterlyPrice());
        column.setYearlyPrice(request.getYearlyPrice());
        column.setCover(request.getCover());
        column.setStatus(Column.Status.PUBLISHED);
        column.setArticleCount(0);
        column.setSubscriberCount(0);
        column.setCreatedAt(LocalDateTime.now());
        column.setUpdatedAt(LocalDateTime.now());

        column = columnRepository.save(column);
        return ApiResponse.success("专栏创建成功", column);
    }
}
