package com.example.interviewbeginner.modules.questionbank.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateQuestionRequest(
        @NotBlank String content,
        @NotBlank String category,
        String difficulty,
        String roleType,
        String referenceAnswer,
        String tags
) {}
