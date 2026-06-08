package com.example.interviewbeginner.modules.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateTemplateRequest(
        @NotBlank String name,
        String description,
        String roleType,
        @NotEmpty List<Long> questionIds
) {}
