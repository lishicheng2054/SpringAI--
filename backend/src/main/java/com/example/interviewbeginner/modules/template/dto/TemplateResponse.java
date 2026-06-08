package com.example.interviewbeginner.modules.template.dto;

import com.example.interviewbeginner.modules.template.InterviewTemplateEntity;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;

public record TemplateResponse(
        Long id, String name, String description, String roleType,
        List<Long> questionIds, Integer questionCount, Boolean isDefault,
        Integer useCount, LocalDateTime createdAt
) {
    public static TemplateResponse fromEntity(InterviewTemplateEntity e, ObjectMapper mapper) {
        List<Long> ids = List.of();
        try {
            if (e.getQuestionIds() != null && !e.getQuestionIds().isBlank()) {
                ids = mapper.readValue(e.getQuestionIds(), new TypeReference<List<Long>>() {});
            }
        } catch (Exception ignored) {}
        return new TemplateResponse(e.getId(), e.getName(), e.getDescription(),
                e.getRoleType(), ids, e.getQuestionCount(), e.getIsDefault(),
                e.getUseCount(), e.getCreatedAt());
    }
}
