package com.knowledge.platform.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ColumnCreateRequest {
    private String title;
    private String description;
    private String category;
    private BigDecimal monthlyPrice;
    private BigDecimal quarterlyPrice;
    private BigDecimal yearlyPrice;
    private String cover;
}
