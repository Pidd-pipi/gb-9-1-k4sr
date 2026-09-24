package com.knowledge.platform.service;

import com.knowledge.platform.entity.PointsAccount;
import com.knowledge.platform.entity.PointsRecord;
import com.knowledge.platform.repository.PointsAccountRepository;
import com.knowledge.platform.repository.PointsRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PointsService {
    @Autowired
    private PointsAccountRepository pointsAccountRepository;

    @Autowired
    private PointsRecordRepository pointsRecordRepository;

    public PointsAccount getOrCreateAccount(String userId) {
        return pointsAccountRepository.findByUserId(userId).orElseGet(() -> {
            PointsAccount account = new PointsAccount();
            account.setUserId(userId);
            account.setBalance(0);
            account.setTotalEarned(0);
            account.setTotalSpent(0);
            account.setCreatedAt(LocalDateTime.now());
            account.setUpdatedAt(LocalDateTime.now());
            return pointsAccountRepository.save(account);
        });
    }

    @Transactional
    public int earnPoints(String userId, int points, String reason) {
        PointsAccount account = getOrCreateAccount(userId);
        account.setBalance(account.getBalance() + points);
        account.setTotalEarned(account.getTotalEarned() + points);
        account.setUpdatedAt(LocalDateTime.now());
        pointsAccountRepository.save(account);

        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setType(PointsRecord.Type.EARN);
        record.setPoints(points);
        record.setReason(reason);
        record.setCreatedAt(LocalDateTime.now());
        pointsRecordRepository.save(record);

        return account.getBalance();
    }

    @Transactional
    public boolean spendPoints(String userId, int points, String reason) {
        Optional<PointsAccount> accountOpt = pointsAccountRepository.findByUserId(userId);
        if (accountOpt.isEmpty()) {
            return false;
        }

        PointsAccount account = accountOpt.get();
        if (account.getBalance() < points) {
            return false;
        }

        account.setBalance(account.getBalance() - points);
        account.setTotalSpent(account.getTotalSpent() + points);
        account.setUpdatedAt(LocalDateTime.now());
        pointsAccountRepository.save(account);

        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setType(PointsRecord.Type.SPEND);
        record.setPoints(points);
        record.setReason(reason);
        record.setCreatedAt(LocalDateTime.now());
        pointsRecordRepository.save(record);

        return true;
    }

    public PointsAccount getAccount(String userId) {
        return getOrCreateAccount(userId);
    }
}
