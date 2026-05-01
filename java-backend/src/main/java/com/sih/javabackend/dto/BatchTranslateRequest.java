package com.sih.javabackend.dto;

import java.util.List;

public class BatchTranslateRequest {

    private List<String> texts;
    private String source_language;
    private String target_language;

    public List<String> getTexts() {
        return texts;
    }

    public void setTexts(List<String> texts) {
        this.texts = texts;
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
}
