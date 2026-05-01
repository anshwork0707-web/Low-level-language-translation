package com.sih.javabackend.service;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class PythonGatewayService {

    private final RestTemplate restTemplate;

    @Value("${python.api.base-url:http://localhost:8000}")
    private String pythonApiBaseUrl;

    public PythonGatewayService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(120))
                .build();
    }

    public Map<String, Object> translate(String text, String sourceLang, String targetLang) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("text", text);
        payload.put("source_lang", sourceLang);
        payload.put("target_lang", targetLang);
        return post("/translate/", payload);
    }

    public Map<String, Object> chat(String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("prompt", message == null ? "" : message);
        return post("/chatbot/", payload);
    }

    public Map<String, Object> correction(Map<String, Object> payload) {
        return post("/translate/correction", payload);
    }

    public Map<String, Object> health() {
        return get("/health/");
    }

    public Map<String, Object> modelStatus() {
        return get("/health/model");
    }

    private Map<String, Object> get(String endpoint) {
        try {
            Map<String, Object> response = toMap(restTemplate.getForObject(pythonApiBaseUrl + endpoint, Map.class));
            return response == null ? new HashMap<>() : response;
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to connect to Python API", exception);
        }
    }

    private Map<String, Object> post(String endpoint, Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_TYPE, "application/json");
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            Map<String, Object> response = toMap(restTemplate.postForObject(
                    pythonApiBaseUrl + endpoint,
                    requestEntity,
                    Map.class
            ));
            return response == null ? new HashMap<>() : response;
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to connect to Python API", exception);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(Object rawResponse) {
        if (rawResponse == null) {
            return null;
        }
        return (Map<String, Object>) rawResponse;
    }
}
