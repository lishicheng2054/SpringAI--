package com.example.interviewbeginner.modules.interview;

import com.example.interviewbeginner.common.exception.BusinessException;
import com.example.interviewbeginner.common.exception.ErrorCode;
import com.example.interviewbeginner.modules.interview.InterviewSessionEntity.SessionStatus;
import com.example.interviewbeginner.modules.interview.dto.CreateSessionRequest;
import com.example.interviewbeginner.modules.interview.dto.CreateSessionResponse;
import com.example.interviewbeginner.modules.interview.dto.InterviewResultResponse;
import com.example.interviewbeginner.modules.interview.dto.SubmitAnswerRequest;
import com.example.interviewbeginner.modules.interview.dto.SubmitAnswerResponse;
import com.example.interviewbeginner.modules.resume.ResumeEntity;
import com.example.interviewbeginner.modules.resume.ResumeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 面试会话核心编排服务。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewSessionService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final ResumeRepository resumeRepository;
    private final InterviewQuestionService questionService;
    private final AnswerEvaluationService evaluationService;
    private final ObjectMapper objectMapper;

    /**
     * 创建面试会话并生成第一题。
     */
    @Transactional
    public CreateSessionResponse createSession(CreateSessionRequest request) {
        // 1. 校验简历存在
        ResumeEntity resume = resumeRepository.findById(request.resumeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND,
                        "简历不存在: id=" + request.resumeId()));

        // 2. 创建会话
        InterviewSessionEntity session = InterviewSessionEntity.builder()
                .resumeId(request.resumeId())
                .roleType(request.roleType())
                .questionCount(request.questionCount())
                .status(SessionStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();
        session = sessionRepository.save(session);

        // 3. 生成题目
        List<InterviewQuestionEntity> questions = questionService.generateAndPersist(
                session, resume.getResumeText(), resume.getTargetPosition(), request.questionCount());
        session.setQuestions(questions);
        sessionRepository.save(session);

        // 4. 返回第一题
        InterviewQuestionEntity first = questions.get(0);
        log.info("Session created: sessionId={}, resumeId={}, questionCount={}",
                session.getSessionId(), request.resumeId(), questions.size());

        return new CreateSessionResponse(
                session.getSessionId(),
                new CreateSessionResponse.FirstQuestion(first.getId(), first.getContent()),
                1,
                questions.size()
        );
    }

    /**
     * 提交答案。
     */
    @Transactional
    public SubmitAnswerResponse submitAnswer(String sessionId, SubmitAnswerRequest request) {
        // 1. 查找会话
        InterviewSessionEntity session = findSession(sessionId);

        // 2. 校验状态
        if (session.getStatus() == SessionStatus.COMPLETED
                || session.getStatus() == SessionStatus.EVALUATED) {
            throw new BusinessException(ErrorCode.INTERVIEW_ALREADY_COMPLETED,
                    "面试已结束: sessionId=" + sessionId);
        }

        // 3. 查找题目
        InterviewQuestionEntity question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERVIEW_QUESTION_NOT_FOUND,
                        "题目不存在: questionId=" + request.questionId()));

        // 4. 评估并保存答案
        evaluationService.evaluateAndPersist(question, session, request.answerText());

        // 5. 判断是否还有下一题
        int nextIndex = session.getCurrentQuestionIndex() + 1;
        session.setCurrentQuestionIndex(nextIndex);
        sessionRepository.save(session);

        if (nextIndex < session.getQuestionCount()) {
            // 返回下一题
            List<InterviewQuestionEntity> questions = getQuestions(session);
            InterviewQuestionEntity next = questions.get(nextIndex);
            return SubmitAnswerResponse.next(next.getId(), next.getContent());
        } else {
            // 面试结束：生成综合评估
            session.setStatus(SessionStatus.COMPLETED);
            session.setCompletedAt(LocalDateTime.now());

            List<InterviewAnswerEntity> answers = answerRepository.findBySessionId(session.getId());
            InterviewEvaluationEntity evaluation = evaluationService.completeAndEvaluate(session, answers);

            session.setStatus(SessionStatus.EVALUATED);
            session.setTotalScore(evaluation.getTotalScore());
            sessionRepository.save(session);

            return SubmitAnswerResponse.finished(evaluation.getId());
        }
    }

    /**
     * 获取面试结果。
     */
    public InterviewResultResponse getResult(String sessionId) {
        InterviewSessionEntity session = findSession(sessionId);

        InterviewEvaluationEntity evaluation = evaluationRepository
                .findBySessionId(session.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERVIEW_SESSION_NOT_FOUND,
                        "评估结果不存在，请先完成面试: sessionId=" + sessionId));

        return buildResultResponse(session, evaluation);
    }

    /**
     * 获取面试历史列表（仅已完成和已评估）。
     */
    public List<Map<String, Object>> getHistory() {
        return sessionRepository
                .findByStatusInOrderByCreatedAtDesc(
                        List.of(SessionStatus.COMPLETED, SessionStatus.EVALUATED))
                .stream()
                .map(s -> Map.<String, Object>of(
                        "sessionId", s.getSessionId(),
                        "resumeId", s.getResumeId(),
                        "roleType", s.getRoleType(),
                        "status", s.getStatus().name(),
                        "totalScore", s.getTotalScore() != null ? s.getTotalScore() : 0,
                        "questionCount", s.getQuestionCount(),
                        "startedAt", s.getStartedAt() != null ? s.getStartedAt().toString() : "",
                        "createdAt", s.getCreatedAt().toString()
                ))
                .toList();
    }

    /**
     * 对比多次面试结果。
     */
    public List<Map<String, Object>> compareSessions(List<String> sessionIds) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (String sid : sessionIds) {
            try {
                InterviewSessionEntity s = findSession(sid);
                InterviewEvaluationEntity e = evaluationRepository.findBySessionId(s.getId()).orElse(null);
                if (e == null) continue;
                results.add(Map.<String, Object>of(
                        "sessionId", sid,
                        "roleType", s.getRoleType(),
                        "totalScore", e.getTotalScore(),
                        "techScore", e.getTechScore(),
                        "communicationScore", e.getCommunicationScore(),
                        "logicScore", e.getLogicScore(),
                        "summary", e.getSummary(),
                        "createdAt", s.getCreatedAt().toString()
                ));
            } catch (Exception ex) {
                log.warn("Session not found for compare: {}", sid);
            }
        }
        return results;
    }

    /**
     * 查找未完成的面试会话（用于中断恢复）。
     */
    public Map<String, Object> findUnfinishedSession(Long resumeId) {
        return sessionRepository
                .findFirstByResumeIdAndStatusIn(resumeId,
                        List.of(SessionStatus.NEW, SessionStatus.IN_PROGRESS))
                .map(s -> {
                    List<InterviewQuestionEntity> questions =
                            questionRepository.findBySessionIdOrderByQuestionIndexAsc(s.getId());
                    InterviewQuestionEntity current = questions.isEmpty() ? null
                            : questions.get(Math.min(s.getCurrentQuestionIndex(), questions.size() - 1));
                    return Map.<String, Object>of(
                            "sessionId", s.getSessionId(),
                            "currentStep", s.getCurrentQuestionIndex() + 1,
                            "totalStep", s.getQuestionCount(),
                            "roleType", s.getRoleType(),
                            "status", s.getStatus().name(),
                            "currentQuestion", current != null
                                    ? Map.of("questionId", current.getId(), "content", current.getContent())
                                    : null
                    );
                })
                .orElse(null);
    }

    /**
     * 获取会话详情。
     */
    public InterviewSessionEntity getSession(String sessionId) {
        return findSession(sessionId);
    }

    // ========== 私有方法 ==========

    private InterviewSessionEntity findSession(String sessionId) {
        return sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERVIEW_SESSION_NOT_FOUND,
                        "面试会话不存在: sessionId=" + sessionId));
    }

    private List<InterviewQuestionEntity> getQuestions(InterviewSessionEntity session) {
        return questionRepository.findBySessionIdOrderByQuestionIndexAsc(session.getId());
    }

    private InterviewResultResponse buildResultResponse(
            InterviewSessionEntity session, InterviewEvaluationEntity eval) {
        return new InterviewResultResponse(
                session.getId(),
                session.getStatus().name(),
                eval.getTotalScore(),
                eval.getTechScore(),
                eval.getCommunicationScore(),
                eval.getLogicScore(),
                parseJsonArray(eval.getStrengths()),
                parseJsonArray(eval.getWeaknesses()),
                parseJsonArray(eval.getImprovements()),
                eval.getSummary()
        );
    }

    @SuppressWarnings("unchecked")
    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, List.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse JSON array: {}", json, e);
            return List.of(json);
        }
    }
}
