package com.example.interviewbeginner.modules.interview;

import com.example.interviewbeginner.common.result.Result;
import com.example.interviewbeginner.infrastructure.export.PdfExportService;
import com.example.interviewbeginner.modules.interview.dto.CreateSessionRequest;
import com.example.interviewbeginner.modules.interview.dto.CreateSessionResponse;
import com.example.interviewbeginner.modules.interview.dto.InterviewResultResponse;
import com.example.interviewbeginner.modules.interview.dto.SubmitAnswerRequest;
import com.example.interviewbeginner.modules.interview.dto.SubmitAnswerResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 模拟面试接口。
 */
@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewSessionService sessionService;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final PdfExportService pdfExportService;

    /**
     * 创建面试会话，返回第一题。
     */
    @PostMapping("/sessions")
    public Result<CreateSessionResponse> createSession(
            @Valid @RequestBody CreateSessionRequest request) {
        return Result.success(sessionService.createSession(request));
    }

    /**
     * 提交答案，返回下一题或最终结果 ID。
     */
    @PostMapping("/sessions/{sessionId}/answers")
    public Result<SubmitAnswerResponse> submitAnswer(
            @PathVariable String sessionId,
            @Valid @RequestBody SubmitAnswerRequest request) {
        return Result.success(sessionService.submitAnswer(sessionId, request));
    }

    /**
     * 查看会话详情。
     */
    @GetMapping("/sessions/{sessionId}")
    public Result<Map<String, Object>> getSession(@PathVariable String sessionId) {
        InterviewSessionEntity session = sessionService.getSession(sessionId);
        return Result.success(Map.of(
                "sessionId", session.getSessionId(),
                "resumeId", session.getResumeId(),
                "roleType", session.getRoleType(),
                "status", session.getStatus().name(),
                "questionCount", session.getQuestionCount(),
                "currentQuestionIndex", session.getCurrentQuestionIndex(),
                "totalScore", session.getTotalScore() != null ? session.getTotalScore() : 0
        ));
    }

    /**
     * 获取最终评分和总结。
     */
    @GetMapping("/sessions/{sessionId}/result")
    public Result<InterviewResultResponse> getResult(@PathVariable String sessionId) {
        return Result.success(sessionService.getResult(sessionId));
    }

    /**
     * 面试历史列表。
     */
    @GetMapping("/history")
    public Result<List<Map<String, Object>>> getHistory() {
        return Result.success(sessionService.getHistory());
    }

    /**
     * 查找未完成的面试（用于中断恢复）。
     */
    @GetMapping("/unfinished/{resumeId}")
    public Result<Map<String, Object>> findUnfinished(@PathVariable Long resumeId) {
        Map<String, Object> result = sessionService.findUnfinishedSession(resumeId);
        return Result.success(result);
    }

    /**
     * 对比多次面试结果。
     */
    @GetMapping("/compare")
    public Result<List<Map<String, Object>>> compare(
            @RequestParam("ids") String ids) {
        List<String> sessionIds = List.of(ids.split(","));
        return Result.success(sessionService.compareSessions(sessionIds));
    }

    /**
     * 导出 PDF 报告。
     */
    @GetMapping("/sessions/{sessionId}/export")
    public ResponseEntity<byte[]> exportPdf(@PathVariable String sessionId) {
        InterviewSessionEntity session = sessionService.getSession(sessionId);
        InterviewEvaluationEntity eval = evaluationRepository
                .findBySessionId(session.getId())
                .orElseThrow(() -> new RuntimeException("评估结果不存在"));
        List<InterviewAnswerEntity> answers = answerRepository.findBySessionId(session.getId());

        byte[] pdf = pdfExportService.exportInterviewReport(session, eval, answers);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=interview-report-" + sessionId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
