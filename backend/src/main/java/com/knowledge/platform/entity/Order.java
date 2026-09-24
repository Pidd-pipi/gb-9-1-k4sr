package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;

    @Indexed(unique = true)
    private String orderNo;

    @Indexed
    private String userId;

    private OrderType type;

    private String itemId;

    private String itemTitle;

    private BigDecimal amount;

    private Status status = Status.PENDING;

    private PaymentMethod paymentMethod;

    private String paymentId;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum OrderType {
        COLUMN_SUBSCRIPTION,
        AUDIO_PURCHASE,
        EBOOK_PURCHASE
    }

    public enum Status {
        PENDING,
        PAID,
        CANCELLED,
        REFUNDED
    }

    public enum PaymentMethod {
        ALIPAY
    }
}
