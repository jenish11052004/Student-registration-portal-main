package com.harsh.fullstackbackend.dto;

public record DomainResponse(
        Long id,
        String program,
        String batch,
        Integer capacity,
        String qualification
) {
}

