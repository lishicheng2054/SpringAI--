package com.example.interviewbeginner.modules.questionbank;

import com.example.interviewbeginner.common.result.Result;
import com.example.interviewbeginner.modules.questionbank.dto.CreateQuestionRequest;
import com.example.interviewbeginner.modules.questionbank.dto.QuestionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/question-bank")
@RequiredArgsConstructor
public class QuestionBankController {

    private final QuestionBankService service;

    @GetMapping
    public Result<List<QuestionResponse>> search(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String roleType,
            @RequestParam(required = false) String keyword) {
        return Result.success(service.search(category, difficulty, roleType, keyword));
    }

    @GetMapping("/categories")
    public Result<List<String>> getCategories() {
        return Result.success(service.getCategories());
    }

    @GetMapping("/grouped")
    public Result<Map<String, List<QuestionResponse>>> getByCategory() {
        return Result.success(service.getByCategory());
    }

    @PostMapping
    public Result<QuestionResponse> create(@Valid @RequestBody CreateQuestionRequest req) {
        return Result.success(service.create(req));
    }

    @DeleteMapping("/{id}")
    public Result<Map<String, String>> delete(@PathVariable Long id) {
        service.delete(id);
        return Result.success(Map.of("status", "deleted"));
    }
}
