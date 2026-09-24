package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "coupons")
public class Coupon {
    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed(unique = true)
    private String code;

    private CouponType type;

    private BigDecimal discountValue;

    private BigDecimal minAmount;

    private LocalDateTime validFrom;

    private LocalDateTime validUntil;

    private Boolean used = false;

    private LocalDateTime usedAt;

    private String orderId;

    private LocalDateTime createdAt;

    public enum CouponType {
        DISCOUNT,
        FREE
    }
}
