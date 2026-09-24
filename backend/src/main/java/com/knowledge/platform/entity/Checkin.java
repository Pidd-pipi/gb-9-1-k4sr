package com.knowledge.platform.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "checkins")
@CompoundIndex(name = "userId_date_idx", def = "{'userId': 1, 'date': 1}", unique = true)
public class Checkin {
    @Id
    private String id;

    private String userId;

    private LocalDate date;

    private LocalDateTime createdAt;
}
