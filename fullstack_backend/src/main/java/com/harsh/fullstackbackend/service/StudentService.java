package com.harsh.fullstackbackend.service;

import com.harsh.fullstackbackend.domain.Domain;
import com.harsh.fullstackbackend.domain.Student;
import com.harsh.fullstackbackend.dto.StudentRequest;
import com.harsh.fullstackbackend.dto.StudentResponse;
import com.harsh.fullstackbackend.exception.FileStorageException;
import com.harsh.fullstackbackend.exception.ResourceNotFoundException;
import com.harsh.fullstackbackend.repository.StudentRepository;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Year;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final DomainService domainService;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public StudentService(StudentRepository studentRepository, DomainService domainService) {
        this.studentRepository = studentRepository;
        this.domainService = domainService;
    }

    @Transactional
    public StudentResponse createStudent(StudentRequest request, MultipartFile photograph) {
        validateStudentRequest(request);
        if (photograph == null || photograph.isEmpty()) {
            throw new IllegalArgumentException("Photograph is required and cannot be empty");
        }
        if (studentRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Domain domain = domainService.getDomainById(request.domainId());
        String rollNumber = generateRollNumber(domain);
        String photoPath = storePhotograph(photograph, rollNumber);

        Student student = new Student();
        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setEmail(request.email());
        student.setCgpa(request.cgpa());
        student.setTotalCredits(request.totalCredits());
        student.setGraduationYear(request.graduationYear());
        student.setDomain(domain);
        student.setSpecialisationId(request.specialisationId());
        student.setPlacementId(request.placementId());
        student.setRollNumber(rollNumber);
        student.setPhotographPath(photoPath);

        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request, MultipartFile photograph) {
        validateStudentRequest(request);

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student %d not found".formatted(id)));

        if (studentRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new IllegalArgumentException("Email already registered");
        }

        Domain domain = domainService.getDomainById(request.domainId());

        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setEmail(request.email());
        student.setCgpa(request.cgpa());
        student.setTotalCredits(request.totalCredits());
        student.setGraduationYear(request.graduationYear());
        student.setDomain(domain);
        student.setSpecialisationId(request.specialisationId());
        student.setPlacementId(request.placementId());

        if (photograph != null && !photograph.isEmpty()) {
            String oldPhotoPath = student.getPhotographPath();
            String photoPath = storePhotograph(photograph, student.getRollNumber());
            student.setPhotographPath(photoPath);
            deletePhotographFile(oldPhotoPath);
        }

        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student %d not found".formatted(id)));
        deletePhotographFile(student.getPhotographPath());
        studentRepository.delete(student);
    }

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public StudentResponse getStudent(Long id) {
        return studentRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Student %d not found".formatted(id)));
    }

    public PhotoResource getStudentPhoto(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student %d not found".formatted(studentId)));

        if (!StringUtils.hasText(student.getPhotographPath())) {
            throw new ResourceNotFoundException("Photograph not available for student %d".formatted(studentId));
        }

        Path photoPath = Path.of(student.getPhotographPath()).toAbsolutePath().normalize();
        if (!Files.exists(photoPath)) {
            throw new ResourceNotFoundException("Photograph file missing for student %d".formatted(studentId));
        }

        try {
            Resource resource = new UrlResource(photoPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new FileStorageException("Photograph cannot be read for student %d".formatted(studentId));
            }
            String contentType = Files.probeContentType(photoPath);
            return new PhotoResource(resource, contentType);
        } catch (MalformedURLException e) {
            throw new FileStorageException("Invalid photograph path for student %d".formatted(studentId), e);
        } catch (IOException e) {
            throw new FileStorageException("Unable to read photograph for student %d".formatted(studentId), e);
        }
    }

    private static final int PREFIX_LENGTH = 2;
    private static final int SEQUENCE_LENGTH = 3;

    private String generateRollNumber(Domain domain) {
        String prefix = determineDomainPrefix(domain);
        String batchSuffix = extractBatchSuffix(domain.getBatch());
        String rollPrefix = prefix + batchSuffix;

        return studentRepository.findTopByRollNumberStartingWithOrderByRollNumberDesc(rollPrefix)
                .map(Student::getRollNumber)
                .map(lastRoll -> rollPrefix + formatSequence(lastRoll.substring(rollPrefix.length())))
                .orElse(rollPrefix + formatSequence(null));
    }

    private String determineDomainPrefix(Domain domain) {
        if (domain == null) {
            return "XX";
        }
        String fromQualification = normalizePrefix(domain.getQualification());
        if (StringUtils.hasText(fromQualification)) {
            return fromQualification;
        }
        String fromProgram = normalizePrefix(domain.getProgram());
        if (StringUtils.hasText(fromProgram)) {
            return fromProgram;
        }
        return "XX";
    }

    private String normalizePrefix(String source) {
        if (!StringUtils.hasText(source)) {
            return null;
        }
        String letters = source.replaceAll("[^A-Za-z]", "").toUpperCase();
        if (!StringUtils.hasText(letters)) {
            return null;
        }
        if (letters.length() >= PREFIX_LENGTH) {
            return letters.substring(0, PREFIX_LENGTH);
        }
        return (letters + "XX").substring(0, PREFIX_LENGTH);
    }

    private String extractBatchSuffix(String batch) {
        if (batch == null || batch.isBlank()) {
            return String.valueOf(Year.now().getValue()).substring(2);
        }
        String digits = batch.replaceAll("\\D", "");
        if (digits.isEmpty()) {
            return String.valueOf(Year.now().getValue()).substring(2);
        }
        if (digits.length() >= 2) {
            return digits.substring(digits.length() - 2);
        }
        return String.format("%02d", Integer.parseInt(digits));
    }

    private String formatSequence(String lastSequence) {
        int next = 1;
        if (StringUtils.hasText(lastSequence)) {
            try {
                next = Integer.parseInt(lastSequence) + 1;
            } catch (NumberFormatException ignored) {
                next = 1;
            }
        }
        return String.format("%0" + SEQUENCE_LENGTH + "d", next);
    }

    private String storePhotograph(MultipartFile file, String rollNumber) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            Path directory = Path.of(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(directory);

            String extension = StringUtils.getFilenameExtension(Objects.requireNonNull(file.getOriginalFilename(), "photo"));
            String safeExtension = extension == null ? "jpg" : extension;
            String filename = "%s_%s.%s".formatted(rollNumber, UUID.randomUUID(), safeExtension);
            Path destination = directory.resolve(filename);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return destination.toString();
        } catch (IOException ex) {
            throw new FileStorageException("Unable to store photograph", ex);
        }
    }

    private void deletePhotographFile(String path) {
        if (!StringUtils.hasText(path)) {
            return;
        }
        try {
            Path filePath = Path.of(path);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // ignore failures while deleting old files
        }
    }

    private void validateStudentRequest(StudentRequest request) {
        if (request.firstName() == null || request.firstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        if (request.lastName() == null || request.lastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (request.email() == null || request.email().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.cgpa() == null) {
            throw new IllegalArgumentException("CGPA is required");
        }
        if (request.totalCredits() == null) {
            throw new IllegalArgumentException("Total credits is required");
        }
        if (request.graduationYear() == null) {
            throw new IllegalArgumentException("Graduation year is required");
        }
        if (request.domainId() == null) {
            throw new IllegalArgumentException("Domain ID is required");
        }
    }

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getRollNumber(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getPhotographPath(),
                student.getCgpa(),
                student.getTotalCredits(),
                student.getGraduationYear(),
                student.getSpecialisationId(),
                student.getPlacementId(),
                student.getDomain().getId(),
                student.getDomain().getProgram(),
                student.getDomain().getBatch()
        );
    }

    public record PhotoResource(Resource resource, String contentType) {
    }
}

