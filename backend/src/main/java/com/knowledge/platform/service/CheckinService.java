package com.knowledge.platform.service;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.entity.Checkin;
import com.knowledge.platform.entity.PointsAccount;
import com.knowledge.platform.repository.CheckinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class CheckinService {
    @Autowired
    private CheckinRepository checkinRepository;

    @Autowired
    private PointsService pointsService;

    @Transactional
    public ApiResponse<Checkin> checkin(String userId) {
        LocalDate today = LocalDate.now();

        if (checkinRepository.existsByUserIdAndDate(userId, today)) {
            return ApiResponse.error("今天已经签到过了");
        }

        Checkin checkin = new Checkin();
        checkin.setUserId(userId);
        checkin.setDate(today);
        checkin.setCreatedAt(LocalDateTime.now());
        checkin = checkinRepository.save(checkin);

        pointsService.earnPoints(userId, 5, "每日签到");

        return ApiResponse.success("签到成功，+5积分", checkin);
    }

    public boolean hasCheckedInToday(String userId) {
        return checkinRepository.existsByUserIdAndDate(userId, LocalDate.now());
    }
}
