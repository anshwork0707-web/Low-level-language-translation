package com.sih.javabackend.dto;

import jakarta.validation.constraints.NotBlank;

public class TranslateRequest {

    @NotBlank
    private String text;

    private String source_lang;
    private String target_lang;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getSource_lang() {
        return source_lang;
    }

    public void setSource_lang(String source_lang) {
        this.source_lang = source_lang;
    }

    public String getTarget_lang() {
        return target_lang;
    }

    public void setTarget_lang(String target_lang) {
        this.target_lang = target_lang;
    }
}
