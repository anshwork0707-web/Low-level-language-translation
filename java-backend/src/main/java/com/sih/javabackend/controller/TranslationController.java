package com.sih.javabackend.controller;

import com.sih.javabackend.dto.BatchTranslateRequest;
import com.sih.javabackend.dto.ChatRequest;
import com.sih.javabackend.dto.CorrectionRequest;
import com.sih.javabackend.dto.TranslateRequest;
import com.sih.javabackend.dto.TranslateResponse;
import com.sih.javabackend.service.PythonGatewayService;
import com.sih.javabackend.service.TranslationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
public class TranslationController {

    private final PythonGatewayService pythonGatewayService;
    private final TranslationService translationService;

    public TranslationController(PythonGatewayService pythonGatewayService, TranslationService translationService) {
        this.pythonGatewayService = pythonGatewayService;
        this.translationService = translationService;
    }

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "SIH Java Backend is running");
        response.put("timestamp", Instant.now().toString());
        response.put("language", "Java + Spring Boot");
        return response;
    }

    @PostMapping("/translate/")
    public ResponseEntity<TranslateResponse> translate(@Valid @RequestBody TranslateRequest request) {
        String sourceLang = normalizeLanguage(request.getSource_lang(), "english");
        String targetLang = normalizeLanguage(request.getTarget_lang(), "english");

        try {
            Map<String, Object> result = pythonGatewayService.translate(request.getText(), sourceLang, targetLang);
            TranslateResponse response = new TranslateResponse();
            response.setOriginal_text(request.getText());
            response.setTranslation(Objects.toString(result.get("translation"), ""));
            response.setSource_language(sourceLang);
            response.setTarget_language(targetLang);
            response.setTimestamp(Instant.now().toString());
            response.setEngine("Python-Model-Service via Java-Gateway");
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            TranslateResponse fallback = translationService.translate(request.getText(), sourceLang, targetLang);
            fallback.setEngine(fallback.getEngine() + " (fallback: python unavailable)");
            return ResponseEntity.ok(fallback);
        }
    }

    @PostMapping("/batch-translate/")
    public Map<String, Object> batchTranslate(@RequestBody BatchTranslateRequest request) {
        List<String> texts = request.getTexts() == null ? List.of() : request.getTexts();
        String sourceLang = normalizeLanguage(request.getSource_language(), "english");
        String targetLang = normalizeLanguage(request.getTarget_language(), "english");

        List<TranslateResponse> results = texts.stream()
                .map(text -> {
                    try {
                        Map<String, Object> item = pythonGatewayService.translate(text, sourceLang, targetLang);
                        TranslateResponse response = new TranslateResponse();
                        response.setOriginal_text(text);
                        response.setTranslation(Objects.toString(item.get("translation"), ""));
                        response.setSource_language(sourceLang);
                        response.setTarget_language(targetLang);
                        response.setTimestamp(Instant.now().toString());
                        response.setEngine("Python-Model-Service via Java-Gateway");
                        return response;
                    } catch (ResponseStatusException ex) {
                        TranslateResponse fallback = translationService.translate(text, sourceLang, targetLang);
                        fallback.setEngine(fallback.getEngine() + " (fallback: python unavailable)");
                        return fallback;
                    }
                })
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("count", results.size());
        response.put("results", results);
        return response;
    }

    @PostMapping("/chat/")
    public Map<String, Object> chat(@RequestBody(required = false) ChatRequest request) {
        String message = request != null && request.getMessage() != null ? request.getMessage() : "";

        try {
            Map<String, Object> pythonResponse = pythonGatewayService.chat(message);
            Map<String, Object> response = new HashMap<>();
            response.put("reply", Objects.toString(pythonResponse.get("response"), ""));
            response.put("suggestions", List.of("Try formal tone", "Try simpler sentence", "Check key terms"));
            return response;
        } catch (ResponseStatusException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("reply", "Java demo chatbot is active. Python chatbot is currently unavailable.");
            response.put("suggestions", List.of("Try formal tone", "Try simpler sentence", "Check key terms"));
            return response;
        }
    }

    @GetMapping("/health/")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "java-gateway");
        response.put("status", "ok");
        try {
            Map<String, Object> pythonHealth = pythonGatewayService.health();
            response.put("python_status", pythonHealth.getOrDefault("status", "unknown"));
        } catch (ResponseStatusException ex) {
            response.put("python_status", "unavailable");
            response.put("mode", "java-fallback");
        }
        response.put("timestamp", Instant.now().toString());
        return response;
    }

    @GetMapping("/models/")
    public Map<String, Object> models() {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> pythonModel = pythonGatewayService.modelStatus();
            response.putAll(pythonModel);
            response.put("active_model", "Python NLLB + LoRA");
        } catch (ResponseStatusException ex) {
            response.put("active_model", "JavaRuleBasedTranslator-v1");
            response.put("status", "python unavailable");
        }
        response.put("runtime", "Java 17");
        response.put("framework", "Spring Boot Gateway + FastAPI Model Service");
        response.put("languages", List.of("nepali", "sinhala", "english"));
        return response;
    }

    @PostMapping("/translate/correction")
    public Map<String, Object> saveCorrection(@RequestBody CorrectionRequest request) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("original_text", request.getOriginal_text());
        payload.put("ai_translation", request.getAi_translation());
        payload.put("user_correction", request.getUser_correction());
        payload.put("source_lang", normalizeLanguage(request.getSource_lang(), "english"));
        payload.put("target_lang", normalizeLanguage(request.getTarget_lang(), "english"));
        return pythonGatewayService.correction(payload);
    }

    private String normalizeLanguage(String lang, String defaultValue) {
        if (lang == null || lang.isBlank()) {
            return defaultValue;
        }

        String normalized = lang.trim().toLowerCase();
        return switch (normalized) {
            case "en", "eng", "english" -> "english";
            case "ne", "nep", "nepali" -> "nepali";
            case "si", "sin", "sinhala", "sinhalese" -> "sinhala";
            default -> defaultValue;
        };
    }
}
