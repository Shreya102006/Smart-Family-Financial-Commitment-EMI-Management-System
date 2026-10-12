package com.smartfamily.financial.service;

import com.smartfamily.financial.dto.FamilyMemberDto;
import com.smartfamily.financial.dto.FamilyMemberRequest;
import com.smartfamily.financial.entity.Family;
import com.smartfamily.financial.entity.FamilyMember;
import com.smartfamily.financial.entity.User;
import com.smartfamily.financial.exception.ResourceNotFoundException;
import com.smartfamily.financial.exception.UnauthorizedException;
import com.smartfamily.financial.repository.CommitmentRepository;
import com.smartfamily.financial.repository.FamilyMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FamilyMemberService {

    private final FamilyMemberRepository familyMemberRepository;
    private final FamilyService familyService;
    private final CommitmentRepository commitmentRepository;
    private final AuthService authService;

    public FamilyMemberService(FamilyMemberRepository familyMemberRepository,
                               FamilyService familyService,
                               CommitmentRepository commitmentRepository,
                               AuthService authService) {
        this.familyMemberRepository = familyMemberRepository;
        this.familyService = familyService;
        this.commitmentRepository = commitmentRepository;
        this.authService = authService;
    }

    @Transactional
    public FamilyMemberDto addMember(FamilyMemberRequest request) {
        Family family = familyService.findFamilyAndVerifyOwnership(request.getFamilyId());

        FamilyMember member = new FamilyMember();
        member.setName(request.getName().trim());
        member.setRelationship(request.getRelationship().trim());
        member.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        member.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        member.setFamily(family);

        member = familyMemberRepository.save(member);
        return toDto(member);
    }

    public List<FamilyMemberDto> getMembersByFamily(Long familyId) {
        familyService.findFamilyAndVerifyOwnership(familyId);
        return familyMemberRepository.findByFamilyId(familyId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<FamilyMemberDto> getAllMyMembers() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return familyMemberRepository.findByFamilyOwnerId(currentUser.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public FamilyMemberDto getMemberById(Long id) {
        FamilyMember member = findMemberAndVerifyOwnership(id);
        return toDto(member);
    }

    @Transactional
    public FamilyMemberDto updateMember(Long id, FamilyMemberRequest request) {
        FamilyMember member = findMemberAndVerifyOwnership(id);
        member.setName(request.getName().trim());
        member.setRelationship(request.getRelationship().trim());
        member.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        member.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);

        if (request.getFamilyId() != null && !request.getFamilyId().equals(member.getFamily().getId())) {
            Family newFamily = familyService.findFamilyAndVerifyOwnership(request.getFamilyId());
            member.setFamily(newFamily);
        }

        member = familyMemberRepository.save(member);
        return toDto(member);
    }

    @Transactional
    public void deleteMember(Long id) {
        FamilyMember member = findMemberAndVerifyOwnership(id);
        familyMemberRepository.delete(member);
    }

    public FamilyMember findMemberAndVerifyOwnership(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        FamilyMember member = familyMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found with id: " + id));

        if (!member.getFamily().getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to access this member");
        }
        return member;
    }

    public FamilyMemberDto toDto(FamilyMember member) {
        FamilyMemberDto dto = new FamilyMemberDto(
                member.getId(),
                member.getName(),
                member.getRelationship(),
                member.getEmail(),
                member.getPhone(),
                member.getFamily().getId(),
                member.getFamily().getFamilyName(),
                member.getCreatedAt()
        );
        dto.setCommitmentCount(commitmentRepository.findByFamilyMemberId(member.getId()).size());
        return dto;
    }
}
