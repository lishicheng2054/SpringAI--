package com.example.interviewbeginner.modules.resume;

import com.example.interviewbeginner.common.exception.BusinessException;
import com.example.interviewbeginner.common.exception.ErrorCode;
import com.example.interviewbeginner.modules.knowledgebase.DocumentParseService;
import com.example.interviewbeginner.modules.resume.dto.ResumeAnalysisResponse;
import com.example.interviewbeginner.modules.resume.dto.ResumeRequest;
import com.example.interviewbeginner.modules.resume.dto.ResumeResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 简历服务。支持文本输入和文件上传两种方式。
 */
@Slf4j
@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisService analysisService;
    private final ResumeAnalysisRepository analysisRepository;
    private final DocumentParseService parseService;
    private final ObjectMapper objectMapper;

    public ResumeService(ResumeRepository resumeRepository,
                         ResumeAnalysisService analysisService,
                         ResumeAnalysisRepository analysisRepository,
                         DocumentParseService parseService,
                         ObjectMapper objectMapper) {
        this.resumeRepository = resumeRepository;
        this.analysisService = analysisService;
        this.analysisRepository = analysisRepository;
        this.parseService = parseService;
        this.objectMapper = objectMapper;
    }

    /**
     * 文本创建简历。
     */
    @Transactional
    public ResumeResponse createResume(ResumeRequest request) {
        ResumeEntity entity = ResumeEntity.builder()
                .candidateName(request.candidateName())
                .targetPosition(request.targetPosition())
                .resumeText(request.resumeText())
                .sourceType("TEXT")
                .build();
        ResumeEntity saved = resumeRepository.save(entity);
        log.info("Resume created: id={}, candidate={}", saved.getId(), saved.getCandidateName());
        return ResumeResponse.fromEntity(saved);
    }

    /**
     * 文件上传创建简历（解析文件内容为 resumeText）。
     */
    @Transactional
    public ResumeResponse uploadResume(String candidateName, String targetPosition,
                                       MultipartFile file) {
        var parsed = parseService.parse(file);
        ResumeEntity entity = ResumeEntity.builder()
                .candidateName(candidateName)
                .targetPosition(targetPosition)
                .resumeText(parsed.text())
                .sourceType("FILE")
                .fileName(parsed.fileName())
                .fileType(parsed.contentType())
                .fileSize(parsed.fileSize())
                .build();
        ResumeEntity saved = resumeRepository.save(entity);
        log.info("Resume uploaded: id={}, file={}, size={}",
                saved.getId(), parsed.fileName(), parsed.fileSize());
        return ResumeResponse.fromEntity(saved);
    }

    public ResumeResponse getResume(Long id) {
        ResumeEntity entity = resumeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND,
                        "简历不存在: id=" + id));
        return ResumeResponse.fromEntity(entity);
    }

    public List<ResumeResponse> listResumes() {
        return resumeRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ResumeResponse::fromEntity).toList();
    }

    /**
     * 删除简历（级联删除分析结果）。
     */
    @Transactional
    public void deleteResume(Long id) {
        ResumeEntity entity = resumeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND,
                        "简历不存在: id=" + id));
        analysisRepository.findByResumeId(id).ifPresent(analysisRepository::delete);
        resumeRepository.delete(entity);
        log.info("Resume deleted: id={}, candidate={}", id, entity.getCandidateName());
    }

    /**
     * 对简历进行 AI 分析。
     */
    @Transactional
    public ResumeAnalysisResponse analyzeResume(Long resumeId) {
        ResumeEntity resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND,
                        "简历不存在: id=" + resumeId));
        ResumeAnalysisEntity analysis = analysisService.analyze(resume);
        return buildAnalysisResponse(analysis);
    }

    /**
     * 获取简历分析结果。
     */
    public ResumeAnalysisResponse getAnalysis(Long resumeId) {
        ResumeAnalysisEntity analysis = analysisService.getAnalysis(resumeId);
        if (analysis == null) {
            throw new BusinessException(ErrorCode.RESUME_NOT_FOUND,
                    "分析结果不存在，请先调用分析接口");
        }
        return buildAnalysisResponse(analysis);
    }

    private ResumeAnalysisResponse buildAnalysisResponse(ResumeAnalysisEntity a) {
        return new ResumeAnalysisResponse(
                a.getResumeId(), a.getSummary(),
                parseList(a.getSkills()), parseList(a.getAdvantages()),
                parseList(a.getRisks()), parseList(a.getSuggestions()),
                a.getAnalysisStatus()
        );
    }

    private List<String> parseList(String json) {
        try {
            if (json == null || json.isBlank()) return List.of();
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of(json != null ? json : "");
        }
    }
}
