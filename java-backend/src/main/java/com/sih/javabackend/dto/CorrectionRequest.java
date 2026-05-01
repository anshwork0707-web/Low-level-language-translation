package com.sih.javabackend.dto;

public class CorrectionRequest {

    private String original_text;
    private String ai_translation;
    private String user_correction;
    private String source_lang;
    private String target_lang;

    public String getOriginal_text() {
        return original_text;
    }

    public void setOriginal_text(String original_text) {
        this.original_text = original_text;
    }

    public String getAi_translation() {
        return ai_translation;
    }

    public void setAi_translation(String ai_translation) {
        this.ai_translation = ai_translation;
    }

    public String getUser_correction() {
        return user_correction;
    }

    public void setUser_correction(String user_correction) {
        this.user_correction = user_correction;
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
