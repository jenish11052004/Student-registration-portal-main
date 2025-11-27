package com.harsh.fullstackbackend.dto;

public record StudentResponse(
        Long id,
        String rollNumber,
        String firstName,
        String lastName,
        String email,
        String photographPath,
        Double cgpa,
        Integer totalCredits,
        Integer graduationYear,
        Integer specialisationId,
        Integer placementId,
        Long domainId,
        String domainProgram,
        String domainBatch
) {
}

