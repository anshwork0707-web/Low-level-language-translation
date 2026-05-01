package com.sih.javabackend.service;

import com.sih.javabackend.dto.TranslateResponse;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class TranslationService {

    private static final String ENGINE = "JavaRuleBasedTranslator-v1";

    private static final Map<String, String> NEPALI_TO_ENGLISH = new HashMap<>();
    private static final Map<String, String> SINHALA_TO_ENGLISH = new HashMap<>();
    private static final Map<String, String> ENGLISH_TO_NEPALI = new HashMap<>();
    private static final Map<String, String> ENGLISH_TO_SINHALA = new HashMap<>();
    private static final Map<String, String> DATASET_NEPALI_TO_ENGLISH = new HashMap<>();
    private static final Map<String, String> DATASET_SINHALA_TO_ENGLISH = new HashMap<>();
    private static final Map<String, String> DATASET_ENGLISH_TO_NEPALI = new HashMap<>();
    private static final Map<String, String> DATASET_ENGLISH_TO_SINHALA = new HashMap<>();
    private static boolean datasetLoaded = false;

    static {
        NEPALI_TO_ENGLISH.put("नमस्ते", "Hello");
        NEPALI_TO_ENGLISH.put("नमस्ते तपाईंलाई कस्तो छ", "Hello, how are you");
        NEPALI_TO_ENGLISH.put("तपाईंलाई कस्तो छ", "How are you");
        NEPALI_TO_ENGLISH.put("नेपालको राजधानी काठमाण्डौ हो", "The capital of Nepal is Kathmandu");
        NEPALI_TO_ENGLISH.put("मलाई किताब पढ्न मन पर्छ", "I like reading books");

        SINHALA_TO_ENGLISH.put("මම පොත් කියවීමට කැමතියි", "I like reading books");
        SINHALA_TO_ENGLISH.put("ශ්‍රී ලංකාවේ අගනුවර කොළඹයි", "The capital of Sri Lanka is Colombo");
        SINHALA_TO_ENGLISH.put("අද කාලගුණය හොඳයි", "The weather is good today");

        ENGLISH_TO_NEPALI.put("hello", "नमस्ते");
        ENGLISH_TO_NEPALI.put("hello how are you", "नमस्ते, तपाईंलाई कस्तो छ?");
        ENGLISH_TO_NEPALI.put("how are you", "तपाईंलाई कस्तो छ?");
        ENGLISH_TO_NEPALI.put("the capital of nepal is kathmandu", "नेपालको राजधानी काठमाण्डौ हो।");
        ENGLISH_TO_NEPALI.put("i like reading books", "मलाई किताब पढ्न मन पर्छ।");
        ENGLISH_TO_NEPALI.put("the weather is nice today", "आज मौसम राम्रो छ।");

        ENGLISH_TO_SINHALA.put("hello", "ආයුබෝවන්");
        ENGLISH_TO_SINHALA.put("hello how are you", "ආයුබෝවන්, ඔබට කොහොමද?");
        ENGLISH_TO_SINHALA.put("how are you", "ඔබට කොහොමද?");
        ENGLISH_TO_SINHALA.put("the capital of sri lanka is colombo", "ශ්‍රී ලංකාවේ අගනුවර කොළඹයි.");
        ENGLISH_TO_SINHALA.put("i like reading books", "මම පොත් කියවීමට කැමතියි.");
        ENGLISH_TO_SINHALA.put("the weather is nice today", "අද කාලගුණය හොඳයි.");
    }

    public TranslationService() {
        loadDatasetLookups();
    }

    public TranslateResponse translate(String text, String sourceLang, String targetLang) {
        String normalizedSource = normalizeLanguage(sourceLang, "auto");
        String normalizedTarget = normalizeLanguage(targetLang, "english");

        String translated = performDemoTranslation(text, normalizedSource, normalizedTarget);

        TranslateResponse response = new TranslateResponse();
        response.setOriginal_text(text);
        response.setTranslation(translated);
        response.setSource_language(normalizedSource);
        response.setTarget_language(normalizedTarget);
        response.setTimestamp(Instant.now().toString());
        response.setEngine(ENGINE);
        return response;
    }

    private String performDemoTranslation(String text, String sourceLang, String targetLang) {
        if (text == null || text.isBlank()) {
            return "";
        }

        String sanitizedText = sanitize(text);
        String detectedSource = "auto".equals(sourceLang) ? detectLanguage(sanitizedText) : sourceLang;

        if (detectedSource.equals(targetLang)) {
            return text;
        }

        if ("english".equals(detectedSource) && "nepali".equals(targetLang)) {
            String exact = lookup(DATASET_ENGLISH_TO_NEPALI, ENGLISH_TO_NEPALI, sanitizedText);
            if (exact != null) {
                return exact;
            }
            return "[Java demo translation] " + text;
        }

        if ("english".equals(detectedSource) && "sinhala".equals(targetLang)) {
            String exact = lookup(DATASET_ENGLISH_TO_SINHALA, ENGLISH_TO_SINHALA, sanitizedText);
            if (exact != null) {
                return exact;
            }
            return "[Java demo translation] " + text;
        }

        if ("nepali".equals(detectedSource) && "english".equals(targetLang)) {
            String exact = lookup(DATASET_NEPALI_TO_ENGLISH, NEPALI_TO_ENGLISH, sanitizedText);
            if (exact != null) {
                return exact;
            }
            return "[Java demo translation] " + text;
        }

        if ("sinhala".equals(detectedSource) && "english".equals(targetLang)) {
            String exact = lookup(DATASET_SINHALA_TO_ENGLISH, SINHALA_TO_ENGLISH, sanitizedText);
            if (exact != null) {
                return exact;
            }
            return "[Java demo translation] " + text;
        }

        return "Unsupported language pair for Java demo mode.";
    }

    private String sanitize(String input) {
        return input.trim()
                .replace("।", " ")
                .replace(".", " ")
                .replace(",", " ")
                .replace("?", " ")
                .replace("!", " ")
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    private String detectLanguage(String text) {
        if (text.codePoints().anyMatch(cp -> cp >= 0x0900 && cp <= 0x097F)) {
            return "nepali";
        }
        if (text.codePoints().anyMatch(cp -> cp >= 0x0D80 && cp <= 0x0DFF)) {
            return "sinhala";
        }
        return "english";
    }

    private String normalizeLanguage(String language, String defaultLang) {
        if (language == null || language.isBlank()) {
            return defaultLang;
        }

        String normalized = language.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "ne", "nep", "nepali" -> "nepali";
            case "si", "sin", "sinhala", "sinhalese" -> "sinhala";
            case "en", "eng", "english" -> "english";
            case "auto" -> "auto";
            default -> defaultLang;
        };
    }

    private String lookup(Map<String, String> primary, Map<String, String> fallback, String key) {
        String fromDataset = primary.get(key);
        if (fromDataset != null) {
            return fromDataset;
        }
        return fallback.get(key);
    }

    private synchronized void loadDatasetLookups() {
        if (datasetLoaded) {
            return;
        }

        List<String> datasetFiles = List.of(
                "split_train.csv",
                "split_dev.csv",
                "split_test.csv",
                "train_pilot.csv"
        );

        for (String fileName : datasetFiles) {
            Path datasetPath = resolveDatasetPath(fileName);
            if (datasetPath == null) {
                continue;
            }
            loadDatasetFile(datasetPath);
        }

        datasetLoaded = true;
    }

    private Path resolveDatasetPath(String fileName) {
        List<Path> candidates = List.of(
                Paths.get("datasets", fileName),
                Paths.get("..", "datasets", fileName),
                Paths.get(System.getProperty("user.dir"), "datasets", fileName),
                Paths.get(System.getProperty("user.dir"), "..", "datasets", fileName)
        );

        for (Path candidate : candidates) {
            Path normalized = candidate.normalize();
            if (Files.exists(normalized) && Files.isRegularFile(normalized)) {
                return normalized;
            }
        }
        return null;
    }

    private void loadDatasetFile(Path filePath) {
        try (BufferedReader reader = Files.newBufferedReader(filePath, StandardCharsets.UTF_8)) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                List<String> columns = parseCsvLine(line);
                if (columns.size() < 3) {
                    continue;
                }

                String src = columns.get(0).trim();
                String tgt = columns.get(1).trim();
                String lang = normalizeLanguage(columns.get(2), "");

                if (src.isBlank() || tgt.isBlank()) {
                    continue;
                }

                String srcKey = sanitize(src);
                String tgtKey = sanitize(tgt);

                if (srcKey.isBlank() || tgtKey.isBlank()) {
                    continue;
                }

                if ("nepali".equals(lang)) {
                    DATASET_NEPALI_TO_ENGLISH.putIfAbsent(srcKey, tgt);
                    DATASET_ENGLISH_TO_NEPALI.putIfAbsent(tgtKey, src);
                } else if ("sinhala".equals(lang)) {
                    DATASET_SINHALA_TO_ENGLISH.putIfAbsent(srcKey, tgt);
                    DATASET_ENGLISH_TO_SINHALA.putIfAbsent(tgtKey, src);
                }
            }
        } catch (IOException ignored) {
        }
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char currentChar = line.charAt(i);

            if (currentChar == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (currentChar == ',' && !inQuotes) {
                values.add(current.toString());
                current.setLength(0);
                continue;
            }

            current.append(currentChar);
        }

        values.add(current.toString());
        return values;
    }
}
