package com.smartfamily.financial.controller;

import com.smartfamily.financial.dto.ApiResponse;
import com.smartfamily.financial.dto.FamilyDto;
import com.smartfamily.financial.dto.FamilyRequest;
import com.smartfamily.financial.service.FamilyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/families")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @PostMapping
    public ResponseEntity<FamilyDto> createFamily(@Valid @RequestBody FamilyRequest request) {
        FamilyDto dto = familyService.createFamily(request);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FamilyDto>> getMyFamilies() {
        return ResponseEntity.ok(familyService.getMyFamilies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamilyDto> getFamilyById(@PathVariable Long id) {
        return ResponseEntity.ok(familyService.getFamilyById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FamilyDto> updateFamily(@PathVariable Long id, @Valid @RequestBody FamilyRequest request) {
        return ResponseEntity.ok(familyService.updateFamily(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteFamily(@PathVariable Long id) {
        familyService.deleteFamily(id);
        return ResponseEntity.ok(new ApiResponse(true, "Family deleted successfully"));
    }
}
