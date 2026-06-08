package com.example.interviewbeginner.modules.questionbank;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "question_bank")
public class QuestionBankEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "category", nullable = false, length = 50)
    private String category;            // ALGORITHM, SYSTEM_DESIGN, BEHAVIORAL, TECH, HR

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String difficulty = "mid";  // easy, mid, hard

    @Column(name = "role_type", length = 100)
    private String roleType;            // Java后端, 前端开发, etc.

    @Column(name = "reference_answer", columnDefinition = "TEXT")
    private String referenceAnswer;

    @Column(length = 500)
    private String tags;               // 逗号分隔: 微服务,并发,数据库

    @Column(name = "use_count")
    @Builder.Default
    private Integer useCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist void prePersist() { this.createdAt = LocalDateTime.now(); }
}
