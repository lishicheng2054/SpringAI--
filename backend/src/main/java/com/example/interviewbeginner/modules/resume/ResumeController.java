package com.example.interviewbeginner.modules.resume;

import com.example.interviewbeginner.common.result.Result;
import com.example.interviewbeginner.modules.resume.dto.ResumeAnalysisResponse;
import com.example.interviewbeginner.modules.resume.dto.ResumeRequest;
import com.example.interviewbeginner.modules.resume.dto.ResumeResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 简历接口。
 */
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    /**
     * 文本创建简历。
     */
    @PostMapping
    public Result<Map<String, Long>> createResume(@Valid @RequestBody ResumeRequest request) {
        ResumeResponse response = resumeService.createResume(request);
        return Result.success(Map.of("resumeId", response.id()));
    }

    /**
     * 文件上传创建简历（PDF/Word/TXT）。
     */
    @PostMapping("/upload")
    public Result<ResumeResponse> uploadResume(
            @RequestParam("candidateName") String candidateName,
            @RequestParam("targetPosition") String targetPosition,
            @RequestParam("file") MultipartFile file) {
        return Result.success(resumeService.uploadResume(candidateName, targetPosition, file));
    }

    /**
     * 查看简历详情。
     */
    @GetMapping("/{resumeId}")
    public Result<ResumeResponse> getResume(@PathVariable Long resumeId) {
        return Result.success(resumeService.getResume(resumeId));
    }

    /**
     * 查看简历列表。
     */
    @GetMapping
    public Result<List<ResumeResponse>> listResumes() {
        return Result.success(resumeService.listResumes());
    }

    /**
     * AI 分析简历。
     */
    @PostMapping("/{resumeId}/analyze")
    public Result<ResumeAnalysisResponse> analyzeResume(@PathVariable Long resumeId) {
        return Result.success(resumeService.analyzeResume(resumeId));
    }

    /**
     * 获取简历分析结果。
     */
    @GetMapping("/{resumeId}/analysis")
    public Result<ResumeAnalysisResponse> getAnalysis(@PathVariable Long resumeId) {
        return Result.success(resumeService.getAnalysis(resumeId));
    }

    /**
     * 删除简历。
     */
    @DeleteMapping("/{resumeId}")
    public Result<Map<String, String>> deleteResume(@PathVariable Long resumeId) {
        resumeService.deleteResume(resumeId);
        return Result.success(Map.of("status", "deleted"));
    }
}
