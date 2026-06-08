package com.example.interviewbeginner.modules.interview;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import com.example.interviewbeginner.modules.interview.InterviewSessionEntity.SessionStatus;

/**
 * 面试会话 Repository。
 */
@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSessionEntity, Long> {

    /**
     * 根据业务 sessionId 查询。
     */
    Optional<InterviewSessionEntity> findBySessionId(String sessionId);

    /**
     * 查询所有已完成/已评估的会话，按时间降序。
     */
    List<InterviewSessionEntity> findByStatusInOrderByCreatedAtDesc(List<SessionStatus> statuses);

    /**
     * 查找简历的未完成会话。
     */
    Optional<InterviewSessionEntity> findFirstByResumeIdAndStatusIn(
            Long resumeId, List<SessionStatus> statuses);
}
