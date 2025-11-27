package com.harsh.fullstackbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StudentRequest(
        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @Email
        @NotBlank(message = "Email is required")
        String email,

        @NotNull(message = "CGPA is required")
        Double cgpa,

        @NotNull(message = "Total credits is required")
        Integer totalCredits,

        @NotNull(message = "Graduation year is required")
        Integer graduationYear,

        @NotNull(message = "Domain id is required")
        Long domainId,

        Integer specialisationId,

        Integer placementId
) {
}

