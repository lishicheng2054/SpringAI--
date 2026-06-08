package com.example.interviewbeginner.infrastructure.export;

import com.example.interviewbeginner.modules.interview.InterviewAnswerEntity;
import com.example.interviewbeginner.modules.interview.InterviewEvaluationEntity;
import com.example.interviewbeginner.modules.interview.InterviewSessionEntity;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * PDF 报告导出服务。
 */
@Service
public class PdfExportService {

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
    private static final Font HEADING_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font NORMAL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font SMALL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9);

    /**
     * 生成面试评估 PDF 报告。
     */
    public byte[] exportInterviewReport(
            InterviewSessionEntity session,
            InterviewEvaluationEntity eval,
            List<InterviewAnswerEntity> answers) {

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // 标题
            Paragraph title = new Paragraph("面试评估报告", TITLE_FONT);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            doc.add(title);

            // 基本信息
            doc.add(new Paragraph("岗位: " + session.getRoleType(), SMALL_FONT));
            doc.add(new Paragraph("日期: " + session.getCreatedAt()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), SMALL_FONT));
            doc.add(new Paragraph(" "));

            // 总分
            Paragraph score = new Paragraph("综合总分: " + eval.getTotalScore() + " / 100", HEADING_FONT);
            score.setSpacingAfter(10);
            doc.add(score);

            // 维度评分表
            PdfPTable dimTable = new PdfPTable(3);
            dimTable.setWidthPercentage(100);
            dimTable.setSpacingAfter(15);
            dimTable.addCell(cell("技术能力", true));
            dimTable.addCell(cell("沟通表达", true));
            dimTable.addCell(cell("逻辑思维", true));
            dimTable.addCell(cell(String.valueOf(eval.getTechScore()), false));
            dimTable.addCell(cell(String.valueOf(eval.getCommunicationScore()), false));
            dimTable.addCell(cell(String.valueOf(eval.getLogicScore()), false));
            doc.add(dimTable);

            // 问答记录表
            doc.add(new Paragraph("问答记录", HEADING_FONT));
            PdfPTable qaTable = new PdfPTable(3);
            qaTable.setWidthPercentage(100);
            qaTable.setWidths(new float[]{5, 30, 10});
            qaTable.addCell(cell("#", true));
            qaTable.addCell(cell("问题", true));
            qaTable.addCell(cell("得分", true));
            for (InterviewAnswerEntity a : answers) {
                qaTable.addCell(cell(String.valueOf(a.getQuestion().getQuestionIndex() + 1), false));
                qaTable.addCell(cell(a.getQuestion().getContent(), false));
                qaTable.addCell(cell(a.getScore() != null ? String.valueOf(a.getScore()) : "-", false));
            }
            qaTable.setSpacingAfter(15);
            doc.add(qaTable);

            // 评语
            doc.add(new Paragraph("总结评语", HEADING_FONT));
            doc.add(new Paragraph(eval.getSummary(), NORMAL_FONT));
            doc.add(new Paragraph(" "));

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF生成失败: " + e.getMessage(), e);
        }
    }

    private PdfPCell cell(String text, boolean header) {
        PdfPCell cell = new PdfPCell(new Phrase(text, header ? HEADING_FONT : SMALL_FONT));
        cell.setPadding(5);
        if (header) cell.setGrayFill(0.9f);
        return cell;
    }
}
