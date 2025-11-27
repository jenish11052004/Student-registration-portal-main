package com.harsh.fullstackbackend.repository;

import com.harsh.fullstackbackend.domain.Domain;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DomainRepository extends JpaRepository<Domain, Long> {
}

