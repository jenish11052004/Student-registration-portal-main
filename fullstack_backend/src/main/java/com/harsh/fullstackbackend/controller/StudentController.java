package com.harsh.fullstackbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.harsh.fullstackbackend.dto.StudentRequest;
import com.harsh.fullstackbackend.dto.StudentResponse;
import com.harsh.fullstackbackend.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final ObjectMapper objectMapper;

    public StudentController(StudentService studentService, ObjectMapper objectMapper) {
        this.studentService = studentService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public List<StudentResponse> getStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{id}")
    public StudentResponse getStudent(@PathVariable Long id) {
        return studentService.getStudent(id);
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<Resource> getStudentPhoto(@PathVariable Long id) {
        StudentService.PhotoResource photo = studentService.getStudentPhoto(id);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (photo.contentType() != null) {
            try {
                mediaType = MediaType.parseMediaType(photo.contentType());
            } catch (InvalidMediaTypeException ignored) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
        }

        String filename = photo.resource().getFilename();
        if (filename == null || filename.isBlank()) {
            filename = "student-%d-photo".formatted(id);
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"%s\"".formatted(filename))
                .body(photo.resource());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse createStudent(HttpServletRequest httpRequest) {
        StudentPayload payload = extractStudentPayload(httpRequest, true);
        return studentService.createStudent(payload.request(), payload.photograph());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StudentResponse updateStudent(@PathVariable Long id, HttpServletRequest httpRequest) {
        StudentPayload payload = extractStudentPayload(httpRequest, false);
        return studentService.updateStudent(id, payload.request(), payload.photograph());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
    }

    private StudentPayload extractStudentPayload(HttpServletRequest httpRequest, boolean photographRequired) {
        if (!(httpRequest instanceof MultipartHttpServletRequest)) {
            throw new IllegalArgumentException("Request must be multipart/form-data");
        }

        MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) httpRequest;

        String studentJson = null;
        MultipartFile photograph = null;

        java.util.Set<String> paramNames = multipartRequest.getParameterMap().keySet();
        java.util.Set<String> fileNames = multipartRequest.getFileMap().keySet();

        studentJson = multipartRequest.getParameter("student");

        if (studentJson == null || studentJson.trim().isEmpty()) {
            MultipartFile studentPart = multipartRequest.getFile("student");
            if (studentPart != null && !studentPart.isEmpty()) {
                try {
                    studentJson = new String(studentPart.getBytes(), StandardCharsets.UTF_8);
                } catch (IOException e) {
                    throw new IllegalArgumentException("Error reading student data: " + e.getMessage(), e);
                }
            }
        }

        photograph = multipartRequest.getFile("photograph");

        if (studentJson == null || studentJson.trim().isEmpty()) {
            String receivedParams = "Received parameters: " + String.join(", ", paramNames);
            String receivedFiles = "Received files: " + String.join(", ", fileNames);
            throw new IllegalArgumentException("Student data is required. " + receivedParams + ". " + receivedFiles + ". Make sure 'student' field is sent as text in form-data.");
        }

        if (photographRequired && (photograph == null || photograph.isEmpty())) {
            throw new IllegalArgumentException("Photograph is required and cannot be empty");
        }

        String trimmedJson = studentJson.trim();

        if (trimmedJson.startsWith("\"") && trimmedJson.endsWith("\"")) {
            trimmedJson = trimmedJson.substring(1, trimmedJson.length() - 1);
            trimmedJson = trimmedJson.replace("\\\"", "\"");
        }

        if ((trimmedJson.matches("^[A-Za-z]:.*") && !trimmedJson.startsWith("{")) ||
                (trimmedJson.contains("\\") && !trimmedJson.contains("\""))) {
            String receivedParams = "Received parameters: " + String.join(", ", paramNames);
            String receivedFiles = "Received files: " + String.join(", ", fileNames);
            throw new IllegalArgumentException("Student field appears to contain a file path instead of JSON. " +
                    "Make sure in Postman: 'student' field type is 'Text' (not 'File'), and 'photograph' field type is 'File'. " +
                    "Received student value: " + trimmedJson.substring(0, Math.min(150, trimmedJson.length())) +
                    ". Parameters: " + receivedParams + ". Files: " + receivedFiles);
        }

        if (!trimmedJson.startsWith("{")) {
            throw new IllegalArgumentException("Student data must be valid JSON starting with '{'. Received: " + trimmedJson.substring(0, Math.min(100, trimmedJson.length())));
        }

        try {
            StudentRequest request = objectMapper.readValue(trimmedJson, StudentRequest.class);
            return new StudentPayload(request, photograph);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid student JSON format: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error processing student data: " + e.getMessage(), e);
        }
    }

    private record StudentPayload(StudentRequest request, MultipartFile photograph) {
    }
}

