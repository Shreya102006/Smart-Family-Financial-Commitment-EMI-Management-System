package com.smartfamily.financial.controller;

import com.smartfamily.financial.dto.ApiResponse;
import com.smartfamily.financial.dto.CommitmentDto;
import com.smartfamily.financial.dto.CommitmentRequest;
import com.smartfamily.financial.service.CommitmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commitments")
public class CommitmentController {

    private final CommitmentService commitmentService;

    public CommitmentController(CommitmentService commitmentService) {
        this.commitmentService = commitmentService;
    }

    @PostMapping
    public ResponseEntity<CommitmentDto> createCommitment(@Valid @RequestBody CommitmentRequest request) {
        CommitmentDto dto = commitmentService.createCommitment(request);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CommitmentDto>> getCommitments(
            @RequestParam(required = false) Long familyId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(commitmentService.getMyCommitments(familyId, status, type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommitmentDto> getCommitmentById(@PathVariable Long id) {
        return ResponseEntity.ok(commitmentService.getCommitmentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommitmentDto> updateCommitment(
            @PathVariable Long id,
            @Valid @RequestBody CommitmentRequest request) {
        return ResponseEntity.ok(commitmentService.updateCommitment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCommitment(@PathVariable Long id) {
        commitmentService.deleteCommitment(id);
        return ResponseEntity.ok(new ApiResponse(true, "Commitment deleted successfully"));
    }
}
