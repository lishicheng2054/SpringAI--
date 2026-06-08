package com.example.interviewbeginner.modules.template;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "interview_template")
public class InterviewTemplateEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "role_type", length = 100)
    private String roleType;

    @Column(name = "question_ids", columnDefinition = "TEXT")
    private String questionIds;       // JSON数组: [1,2,3]

    @Column(name = "question_count")
    @Builder.Default
    private Integer questionCount = 5;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "use_count")
    @Builder.Default
    private Integer useCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist void prePersist() { this.createdAt = LocalDateTime.now(); }
}
