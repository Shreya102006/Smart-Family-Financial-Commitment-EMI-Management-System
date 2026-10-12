package com.smartfamily.financial.service;

import com.smartfamily.financial.dto.FamilyDto;
import com.smartfamily.financial.dto.FamilyMemberDto;
import com.smartfamily.financial.dto.FamilyRequest;
import com.smartfamily.financial.entity.Family;
import com.smartfamily.financial.entity.User;
import com.smartfamily.financial.exception.ResourceNotFoundException;
import com.smartfamily.financial.exception.UnauthorizedException;
import com.smartfamily.financial.repository.CommitmentRepository;
import com.smartfamily.financial.repository.FamilyMemberRepository;
import com.smartfamily.financial.repository.FamilyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final CommitmentRepository commitmentRepository;
    private final AuthService authService;

    public FamilyService(FamilyRepository familyRepository,
                         FamilyMemberRepository familyMemberRepository,
                         CommitmentRepository commitmentRepository,
                         AuthService authService) {
        this.familyRepository = familyRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.commitmentRepository = commitmentRepository;
        this.authService = authService;
    }

    @Transactional
    public FamilyDto createFamily(FamilyRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Family family = new Family();
        family.setFamilyName(request.getFamilyName().trim());
        family.setOwner(currentUser);
        family = familyRepository.save(family);
        return toDto(family);
    }

    public List<FamilyDto> getMyFamilies() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return familyRepository.findByOwnerId(currentUser.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public FamilyDto getFamilyById(Long id) {
        Family family = findFamilyAndVerifyOwnership(id);
        return toDto(family);
    }

    @Transactional
    public FamilyDto updateFamily(Long id, FamilyRequest request) {
        Family family = findFamilyAndVerifyOwnership(id);
        family.setFamilyName(request.getFamilyName().trim());
        family = familyRepository.save(family);
        return toDto(family);
    }

    @Transactional
    public void deleteFamily(Long id) {
        Family family = findFamilyAndVerifyOwnership(id);
        familyRepository.delete(family);
    }

    public Family findFamilyAndVerifyOwnership(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Family family = familyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family not found with id: " + id));

        if (!family.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to access this family");
        }
        return family;
    }

    public FamilyDto toDto(Family family) {
        FamilyDto dto = new FamilyDto(
                family.getId(),
                family.getFamilyName(),
                family.getOwner() != null ? family.getOwner().getId() : null,
                family.getOwner() != null ? family.getOwner().getFullName() : null,
                family.getCreatedAt()
        );

        List<FamilyMemberDto> memberDtos = familyMemberRepository.findByFamilyId(family.getId()).stream()
                .map(m -> {
                    FamilyMemberDto md = new FamilyMemberDto(
                            m.getId(),
                            m.getName(),
                            m.getRelationship(),
                            m.getEmail(),
                            m.getPhone(),
                            family.getId(),
                            family.getFamilyName(),
                            m.getCreatedAt()
                    );
                    md.setCommitmentCount(commitmentRepository.findByFamilyMemberId(m.getId()).size());
                    return md;
                })
                .collect(Collectors.toList());

        dto.setMembers(memberDtos);
        dto.setMemberCount(memberDtos.size());
        dto.setCommitmentCount(commitmentRepository.findByFamilyId(family.getId()).size());
        return dto;
    }
}
