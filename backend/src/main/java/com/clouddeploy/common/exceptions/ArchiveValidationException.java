package com.clouddeploy.common.exceptions;

import lombok.Getter;

@Getter
public class ArchiveValidationException extends RuntimeException {
    private final String errorCode;

    public ArchiveValidationException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
