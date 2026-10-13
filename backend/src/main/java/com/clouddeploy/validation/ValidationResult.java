package com.clouddeploy.validation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResult {
    private boolean valid;
    private int fileCount;
    private long totalUncompressedBytes;
    private String errorCode;
    private String errorMessage;
    private List<String> extractedFiles;

    public static ValidationResult success(int fileCount, long totalBytes, List<String> files) {
        return ValidationResult.builder()
                .valid(true)
                .fileCount(fileCount)
                .totalUncompressedBytes(totalBytes)
                .extractedFiles(files)
                .build();
    }

    public static ValidationResult failure(String errorCode, String errorMessage) {
        return ValidationResult.builder()
                .valid(false)
                .errorCode(errorCode)
                .errorMessage(errorMessage)
                .build();
    }
}
