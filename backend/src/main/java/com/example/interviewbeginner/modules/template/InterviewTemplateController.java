package com.example.interviewbeginner.modules.template;

import com.example.interviewbeginner.common.result.Result;
import com.example.interviewbeginner.modules.template.dto.CreateTemplateRequest;
import com.example.interviewbeginner.modules.template.dto.TemplateResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class InterviewTemplateController {

    private final InterviewTemplateService service;

    @GetMapping
    public Result<List<TemplateResponse>> list(
            @RequestParam(required = false) String roleType) {
        if (roleType != null) return Result.success(service.listByRole(roleType));
        return Result.success(service.listAll());
    }

    @GetMapping("/{id}")
    public Result<TemplateResponse> get(@PathVariable Long id) {
        return Result.success(service.getById(id));
    }

    @PostMapping
    public Result<TemplateResponse> create(@Valid @RequestBody CreateTemplateRequest req) {
        return Result.success(service.create(req));
    }

    @DeleteMapping("/{id}")
    public Result<Map<String, String>> delete(@PathVariable Long id) {
        service.delete(id);
        return Result.success(Map.of("status", "deleted"));
    }

    @PostMapping("/{id}/apply")
    public Result<List<Map<String, Object>>> apply(@PathVariable Long id) {
        return Result.success(service.applyTemplate(id));
    }
}
