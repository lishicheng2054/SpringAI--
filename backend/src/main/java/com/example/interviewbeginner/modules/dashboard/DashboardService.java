package com.example.interviewbeginner.modules.dashboard;

import com.example.interviewbeginner.modules.interview.InterviewAnswerRepository;
import com.example.interviewbeginner.modules.interview.InterviewEvaluationRepository;
import com.example.interviewbeginner.modules.interview.InterviewSessionEntity.SessionStatus;
import com.example.interviewbeginner.modules.interview.InterviewSessionRepository;
import com.example.interviewbeginner.modules.interviewschedule.InterviewScheduleRepository;
import com.example.interviewbeginner.modules.knowledgebase.KnowledgeBaseRepository;
import com.example.interviewbeginner.modules.knowledgebase.KnowledgeDocumentRepository;
import com.example.interviewbeginner.modules.resume.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ResumeRepository resumeRepo;
    private final InterviewSessionRepository sessionRepo;
    private final InterviewEvaluationRepository evalRepo;
    private final InterviewAnswerRepository answerRepo;
    private final KnowledgeBaseRepository kbRepo;
    private final KnowledgeDocumentRepository docRepo;
    private final InterviewScheduleRepository scheduleRepo;

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        // 概览
        stats.put("totalResumes", resumeRepo.count());
        stats.put("totalSessions", sessionRepo.count());
        stats.put("completedSessions", sessionRepo
                .findByStatusInOrderByCreatedAtDesc(
                        List.of(SessionStatus.COMPLETED, SessionStatus.EVALUATED)).size());
        stats.put("totalKbs", kbRepo.count());
        stats.put("totalDocuments", docRepo.count());
        stats.put("totalSchedules", scheduleRepo.count());

        // 平均分
        Double avgScore = evalRepo.findAll().stream()
                .mapToInt(e -> e.getTotalScore() != null ? e.getTotalScore() : 0)
                .average().orElse(0);
        stats.put("avgScore", Math.round(avgScore * 10.0) / 10.0);

        // 维度平均分
        stats.put("avgTechScore", Math.round(evalRepo.findAll().stream()
                .mapToInt(e -> e.getTechScore() != null ? e.getTechScore() : 0)
                .average().orElse(0) * 10.0) / 10.0);
        stats.put("avgCommScore", Math.round(evalRepo.findAll().stream()
                .mapToInt(e -> e.getCommunicationScore() != null ? e.getCommunicationScore() : 0)
                .average().orElse(0) * 10.0) / 10.0);
        stats.put("avgLogicScore", Math.round(evalRepo.findAll().stream()
                .mapToInt(e -> e.getLogicScore() != null ? e.getLogicScore() : 0)
                .average().orElse(0) * 10.0) / 10.0);

        // 分数趋势（最近10次）- 分值和日期匹配
        var sessions = sessionRepo.findByStatusInOrderByCreatedAtDesc(
                List.of(SessionStatus.COMPLETED, SessionStatus.EVALUATED));
        List<Map<String, Object>> trends = new ArrayList<>();
        for (var s : sessions.stream().limit(10).toList()) {
            evalRepo.findBySessionId(s.getId()).ifPresent(e -> {
                trends.add(Map.<String, Object>of(
                        "date", s.getCreatedAt().toLocalDate().toString(),
                        "score", e.getTotalScore(),
                        "role", s.getRoleType()
                ));
            });
        }
        Collections.reverse(trends);
        stats.put("scoreTrends", trends);

        // 岗位分布
        Map<String, Long> roleDist = sessions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getRoleType() != null ? s.getRoleType() : "未知",
                        Collectors.counting()));
        stats.put("roleDistribution", roleDist);

        // 最近活动
        List<Map<String, Object>> activities = new ArrayList<>();
        resumeRepo.findAllByOrderByCreatedAtDesc().stream().limit(5).forEach(r ->
                activities.add(Map.<String, Object>of(
                        "type", "resume", "desc", "创建简历: " + r.getCandidateName(),
                        "time", r.getCreatedAt().toString())));
        sessions.stream().limit(5).forEach(s ->
                activities.add(Map.<String, Object>of(
                        "type", "interview", "desc", "完成面试: " + s.getRoleType() + "(" + s.getTotalScore() + "分)",
                        "time", s.getCreatedAt().toString())));
        activities.sort((a, b) -> ((String) b.get("time")).compareTo((String) a.get("time")));
        stats.put("recentActivities", activities.stream().limit(10).toList());

        return stats;
    }
}
