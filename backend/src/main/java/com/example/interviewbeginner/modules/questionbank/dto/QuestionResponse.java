package com.example.interviewbeginner.modules.questionbank.dto;

import com.example.interviewbeginner.modules.questionbank.QuestionBankEntity;

import java.time.LocalDateTime;

public record QuestionResponse(
        Long id, String content, String category, String difficulty,
        String roleType, String referenceAnswer, String tags,
        Integer useCount, LocalDateTime createdAt
) {
    public static QuestionResponse fromEntity(QuestionBankEntity e) {
        return new QuestionResponse(e.getId(), e.getContent(), e.getCategory(),
                e.getDifficulty(), e.getRoleType(), e.getReferenceAnswer(),
                e.getTags(), e.getUseCount(), e.getCreatedAt());
    }
}
