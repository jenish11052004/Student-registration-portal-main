package com.harsh.fullstackbackend.service;

import com.harsh.fullstackbackend.domain.Domain;
import com.harsh.fullstackbackend.dto.DomainRequest;
import com.harsh.fullstackbackend.dto.DomainResponse;
import com.harsh.fullstackbackend.exception.ResourceNotFoundException;
import com.harsh.fullstackbackend.repository.DomainRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DomainService {

    private final DomainRepository domainRepository;

    public DomainService(DomainRepository domainRepository) {
        this.domainRepository = domainRepository;
    }

    public List<DomainResponse> getAllDomains() {
        return domainRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public DomainResponse createDomain(DomainRequest request) {
        Domain domain = new Domain();
        domain.setProgram(request.program());
        domain.setBatch(request.batch());
        domain.setCapacity(request.capacity());
        domain.setQualification(request.qualification());
        return toResponse(domainRepository.save(domain));
    }

    public Domain getDomainById(Long domainId) {
        return domainRepository.findById(domainId)
                .orElseThrow(() -> new ResourceNotFoundException("Domain %d not found".formatted(domainId)));
    }

    private DomainResponse toResponse(Domain domain) {
        return new DomainResponse(
                domain.getId(),
                domain.getProgram(),
                domain.getBatch(),
                domain.getCapacity(),
                domain.getQualification()
        );
    }
}

