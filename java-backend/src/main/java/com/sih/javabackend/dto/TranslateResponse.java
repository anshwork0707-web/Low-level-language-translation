package com.sih.javabackend.dto;

public class TranslateResponse {

    private String translation;
    private String original_text;
    private String source_language;
    private String target_language;
    private String timestamp;
    private String engine;

    public String getTranslation() {
        return translation;
    }

    public void setTranslation(String translation) {
        this.translation = translation;
    }

    public String getOriginal_text() {
        return original_text;
    }

    public void setOriginal_text(String original_text) {
        this.original_text = original_text;
    }

    public String getSource_language() {
        return source_language;
    }

    public void setSource_language(String source_language) {
        this.source_language = source_language;
    }

    public String getTarget_language() {
        return target_language;
    }

    public void setTarget_language(String target_language) {
        this.target_language = target_language;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getEngine() {
        return engine;
    }

    public void setEngine(String engine) {
        this.engine = engine;
    }
}
