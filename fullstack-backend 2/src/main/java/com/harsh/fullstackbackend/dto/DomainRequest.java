package com.harsh.fullstackbackend.dto;

import jakarta.validation.constraints.NotBlank;

public record DomainRequest(
        @NotBlank(message = "Program is required")
        String program,

        @NotBlank(message = "Batch is required")
        String batch,

        Integer capacity,

        String qualification
) {
}

