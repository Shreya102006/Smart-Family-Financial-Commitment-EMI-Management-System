package com.smartfamily.financial.controller;

import com.smartfamily.financial.dto.ApiResponse;
import com.smartfamily.financial.dto.FamilyMemberDto;
import com.smartfamily.financial.dto.FamilyMemberRequest;
import com.smartfamily.financial.service.FamilyMemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family-members")
public class FamilyMemberController {

    private final FamilyMemberService familyMemberService;

    public FamilyMemberController(FamilyMemberService familyMemberService) {
        this.familyMemberService = familyMemberService;
    }

    @PostMapping
    public ResponseEntity<FamilyMemberDto> addMember(@Valid @RequestBody FamilyMemberRequest request) {
        FamilyMemberDto dto = familyMemberService.addMember(request);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FamilyMemberDto>> getMembers(@RequestParam(required = false) Long familyId) {
        if (familyId != null) {
            return ResponseEntity.ok(familyMemberService.getMembersByFamily(familyId));
        }
        return ResponseEntity.ok(familyMemberService.getAllMyMembers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamilyMemberDto> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(familyMemberService.getMemberById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FamilyMemberDto> updateMember(@PathVariable Long id, @Valid @RequestBody FamilyMemberRequest request) {
        return ResponseEntity.ok(familyMemberService.updateMember(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteMember(@PathVariable Long id) {
        familyMemberService.deleteMember(id);
        return ResponseEntity.ok(new ApiResponse(true, "Family member deleted successfully"));
    }
}
