package com.knowledge.platform.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreatorApplyRequest {
    private String bio;
    private List<String> expertise;
    private String socialLinks;
}
