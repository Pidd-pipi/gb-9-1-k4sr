package com.knowledge.platform.service;

import com.knowledge.platform.dto.ApiResponse;
import com.knowledge.platform.dto.CreatorApplyRequest;
import com.knowledge.platform.entity.Creator;
import com.knowledge.platform.entity.User;
import com.knowledge.platform.repository.CreatorRepository;
import com.knowledge.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CreatorService {
    @Autowired
    private CreatorRepository creatorRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ApiResponse<Creator> apply(String userId, CreatorApplyRequest request) {
        if (creatorRepository.existsByUserId(userId)) {
            return ApiResponse.error("您已经提交过创作者申请");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("用户不存在");
        }
        User user = userOpt.get();

        Creator creator = new Creator();
        creator.setUserId(userId);
        creator.setUsername(user.getUsername());
        creator.setAvatar(user.getAvatar());
        creator.setBio(request.getBio());
        creator.setExpertise(request.getExpertise());
        creator.setSocialLinks(request.getSocialLinks());
        creator.setStatus(Creator.Status.PENDING);
        creator.setCreatedAt(LocalDateTime.now());
        creator.setUpdatedAt(LocalDateTime.now());

        creator = creatorRepository.save(creator);
        return ApiResponse.success("申请已提交，请等待审核", creator);
    }

    public ApiResponse<Creator> getById(String id) {
        Optional<Creator> creatorOpt = creatorRepository.findById(id);
        if (creatorOpt.isEmpty()) {
            return ApiResponse.error("创作者不存在");
        }
        return ApiResponse.success(creatorOpt.get());
    }

    public ApiResponse<Creator> getByUserId(String userId) {
        Optional<Creator> creatorOpt = creatorRepository.findByUserId(userId);
        if (creatorOpt.isEmpty()) {
            return ApiResponse.error("创作者不存在");
        }
        return ApiResponse.success(creatorOpt.get());
    }

    public boolean isApprovedCreator(String userId) {
        Optional<Creator> creatorOpt = creatorRepository.findByUserId(userId);
        return creatorOpt.isPresent() && creatorOpt.get().getStatus() == Creator.Status.APPROVED;
    }
}
