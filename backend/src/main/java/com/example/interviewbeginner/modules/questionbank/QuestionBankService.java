package com.example.interviewbeginner.modules.questionbank;

import com.example.interviewbeginner.common.exception.BusinessException;
import com.example.interviewbeginner.common.exception.ErrorCode;
import com.example.interviewbeginner.modules.questionbank.dto.CreateQuestionRequest;
import com.example.interviewbeginner.modules.questionbank.dto.QuestionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionBankService {

    private final QuestionBankRepository repo;

    public List<QuestionResponse> listAll() {
        return repo.findAll().stream().map(QuestionResponse::fromEntity).toList();
    }

    public List<QuestionResponse> search(String category, String difficulty, String roleType, String keyword) {
        List<QuestionBankEntity> results;
        if (category != null && difficulty != null) {
            results = repo.findByCategoryAndDifficultyOrderByUseCountDesc(category, difficulty);
        } else if (category != null) {
            results = repo.findByCategoryOrderByUseCountDesc(category);
        } else if (difficulty != null) {
            results = repo.findByDifficultyOrderByUseCountDesc(difficulty);
        } else if (keyword != null && !keyword.isBlank()) {
            results = repo.findByContentContainingIgnoreCase(keyword);
        } else if (roleType != null) {
            results = repo.findByRoleTypeContainingIgnoreCaseOrderByUseCountDesc(roleType);
        } else {
            results = repo.findAll();
        }
        return results.stream().map(QuestionResponse::fromEntity).toList();
    }

    public Map<String, List<QuestionResponse>> getByCategory() {
        Map<String, List<QuestionResponse>> map = new LinkedHashMap<>();
        for (QuestionBankEntity q : repo.findAll()) {
            map.computeIfAbsent(q.getCategory(), k -> new ArrayList<>())
                    .add(QuestionResponse.fromEntity(q));
        }
        return map;
    }

    @Transactional
    public QuestionResponse create(CreateQuestionRequest req) {
        QuestionBankEntity q = QuestionBankEntity.builder()
                .content(req.content())
                .category(req.category())
                .difficulty(req.difficulty() != null ? req.difficulty() : "mid")
                .roleType(req.roleType())
                .referenceAnswer(req.referenceAnswer())
                .tags(req.tags())
                .build();
        return QuestionResponse.fromEntity(repo.save(q));
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new BusinessException(ErrorCode.NOT_FOUND, "题目不存在");
        repo.deleteById(id);
    }

    public List<String> getCategories() {
        return List.of("ALGORITHM", "SYSTEM_DESIGN", "BEHAVIORAL", "TECH", "HR");
    }
}
