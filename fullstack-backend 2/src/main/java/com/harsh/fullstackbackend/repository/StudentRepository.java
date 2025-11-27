package com.harsh.fullstackbackend.repository;

import com.harsh.fullstackbackend.domain.Student;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findTopByRollNumberStartingWithOrderByRollNumberDesc(String rollNumberPrefix);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
}

