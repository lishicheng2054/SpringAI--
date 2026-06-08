package com.example.interviewbeginner.modules.template;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewTemplateRepository extends JpaRepository<InterviewTemplateEntity, Long> {

    List<InterviewTemplateEntity> findByRoleTypeOrderByUseCountDesc(String roleType);

    List<InterviewTemplateEntity> findByIsDefaultTrueOrderByUseCountDesc();
}
