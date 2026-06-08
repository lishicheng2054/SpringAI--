package com.example.interviewbeginner.modules.questionbank;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBankEntity, Long> {

    List<QuestionBankEntity> findByCategoryOrderByUseCountDesc(String category);

    List<QuestionBankEntity> findByRoleTypeContainingIgnoreCaseOrderByUseCountDesc(String roleType);

    List<QuestionBankEntity> findByDifficultyOrderByUseCountDesc(String difficulty);

    List<QuestionBankEntity> findByContentContainingIgnoreCase(String keyword);

    List<QuestionBankEntity> findByCategoryAndDifficultyOrderByUseCountDesc(
            String category, String difficulty);
}
