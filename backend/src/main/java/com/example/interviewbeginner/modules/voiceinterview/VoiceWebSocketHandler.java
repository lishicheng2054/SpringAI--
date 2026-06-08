package com.example.interviewbeginner.modules.voiceinterview;

import com.example.interviewbeginner.modules.interview.InterviewSessionService;
import com.example.interviewbeginner.modules.interview.dto.SubmitAnswerRequest;
import com.example.interviewbeginner.modules.interview.dto.SubmitAnswerResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 语音面试 WebSocket 处理器。
 * 消息格式：{"type":"ANSWER","questionId":1,"answerText":"..."}
 * 响应格式：{"type":"NEXT_QUESTION","questionId":2,"content":"..."} 或 {"type":"FINISHED","resultId":1}
 */
@Slf4j
@Component
public class VoiceWebSocketHandler extends TextWebSocketHandler {

    private final InterviewSessionService sessionService;
    private final ObjectMapper mapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    public VoiceWebSocketHandler(InterviewSessionService sessionService, ObjectMapper mapper) {
        this.sessionService = sessionService;
        this.mapper = mapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String path = session.getUri().getPath();
        String sessionId = path.substring(path.lastIndexOf('/') + 1);
        sessions.put(sessionId, session);
        log.info("Voice WS connected: sessionId={}", sessionId);
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void handleTextMessage(WebSocketSession ws, TextMessage message) throws Exception {
        Map<String, Object> msg = mapper.readValue(message.getPayload(), Map.class);
        String type = (String) msg.get("type");
        String sessionId = extractSessionId(ws);

        if ("ANSWER".equals(type)) {
            long questionId = ((Number) msg.get("questionId")).longValue();
            String answerText = (String) msg.get("answerText");

            SubmitAnswerResponse result = sessionService.submitAnswer(sessionId,
                    new SubmitAnswerRequest(questionId, answerText));

            Map<String, Object> reply = new java.util.LinkedHashMap<>();
            if (result.hasNext() && result.nextQuestion() != null) {
                reply.put("type", "NEXT_QUESTION");
                reply.put("questionId", result.nextQuestion().questionId());
                reply.put("content", result.nextQuestion().content());
            } else {
                reply.put("type", "FINISHED");
                reply.put("resultId", result.resultId());
                reply.put("sessionId", sessionId);
            }
            ws.sendMessage(new TextMessage(mapper.writeValueAsString(reply)));
        } else if ("PING".equals(type)) {
            ws.sendMessage(new TextMessage("{\"type\":\"PONG\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = extractSessionId(session);
        sessions.remove(sessionId);
        log.info("Voice WS closed: sessionId={}", sessionId);
    }

    private String extractSessionId(WebSocketSession ws) {
        String path = ws.getUri().getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }
}
