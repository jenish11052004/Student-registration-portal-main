package com.harsh.fullstackbackend.controller;

import com.harsh.fullstackbackend.dto.DomainRequest;
import com.harsh.fullstackbackend.dto.DomainResponse;
import com.harsh.fullstackbackend.service.DomainService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/domains")
public class DomainController {

    private final DomainService domainService;

    public DomainController(DomainService domainService) {
        this.domainService = domainService;
    }

    @GetMapping
    public List<DomainResponse> getDomains() {
        return domainService.getAllDomains();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DomainResponse createDomain(@Valid @RequestBody DomainRequest request) {
        return domainService.createDomain(request);
    }
}

