package com.example.interviewbeginner.modules.template;

import com.example.interviewbeginner.common.exception.BusinessException;
import com.example.interviewbeginner.common.exception.ErrorCode;
import com.example.interviewbeginner.modules.questionbank.QuestionBankEntity;
import com.example.interviewbeginner.modules.questionbank.QuestionBankRepository;
import com.example.interviewbeginner.modules.template.dto.CreateTemplateRequest;
import com.example.interviewbeginner.modules.template.dto.TemplateResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class InterviewTemplateService {

    private final InterviewTemplateRepository repo;
    private final QuestionBankRepository questionRepo;
    private final ObjectMapper mapper;

    public List<TemplateResponse> listAll() {
        return repo.findAll().stream()
                .map(e -> TemplateResponse.fromEntity(e, mapper)).toList();
    }

    public List<TemplateResponse> listByRole(String roleType) {
        return repo.findByRoleTypeOrderByUseCountDesc(roleType).stream()
                .map(e -> TemplateResponse.fromEntity(e, mapper)).toList();
    }

    public TemplateResponse getById(Long id) {
        InterviewTemplateEntity e = repo.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "模板不存在"));
        return TemplateResponse.fromEntity(e, mapper);
    }

    @Transactional
    public TemplateResponse create(CreateTemplateRequest req) {
        try {
            String idsJson = mapper.writeValueAsString(req.questionIds());
            InterviewTemplateEntity t = InterviewTemplateEntity.builder()
                    .name(req.name()).description(req.description())
                    .roleType(req.roleType())
                    .questionIds(idsJson)
                    .questionCount(req.questionIds().size())
                    .build();
            return TemplateResponse.fromEntity(repo.save(t), mapper);
        } catch (Exception e) {
            throw new RuntimeException("创建模板失败", e);
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new BusinessException(ErrorCode.NOT_FOUND, "模板不存在");
        repo.deleteById(id);
    }

    /**
     * 应用模板：返回题目内容列表。
     */
    public List<Map<String, Object>> applyTemplate(Long templateId) {
        InterviewTemplateEntity t = repo.findById(templateId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "模板不存在"));

        List<Long> ids;
        try {
            ids = mapper.readValue(t.getQuestionIds(), new com.fasterxml.jackson.core.type.TypeReference<List<Long>>() {});
        } catch (Exception e) { throw new RuntimeException("模板题目解析失败", e); }

        List<Map<String, Object>> questions = new ArrayList<>();
        for (int i = 0; i < ids.size(); i++) {
            Long qid = ids.get(i);
            QuestionBankEntity q = questionRepo.findById(qid).orElse(null);
            if (q == null) continue;
            questions.add(Map.<String, Object>of(
                    "index", i, "questionId", q.getId(),
                    "content", q.getContent(), "category", q.getCategory(),
                    "difficulty", q.getDifficulty()
            ));
        }
        // 更新使用次数
        t.setUseCount(t.getUseCount() + 1);
        repo.save(t);

        return questions;
    }
}
