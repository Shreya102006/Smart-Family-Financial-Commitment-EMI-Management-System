package com.smartfamily.financial.dto;

import java.time.LocalDateTime;
import java.util.List;

public class FamilyDto {

    private Long id;
    private String familyName;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
    private List<FamilyMemberDto> members;
    private int memberCount;
    private int commitmentCount;

    public FamilyDto() {
    }

    public FamilyDto(Long id, String familyName, Long ownerId, String ownerName, LocalDateTime createdAt) {
        this.id = id;
        this.familyName = familyName;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFamilyName() {
        return familyName;
    }

    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<FamilyMemberDto> getMembers() {
        return members;
    }

    public void setMembers(List<FamilyMemberDto> members) {
        this.members = members;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }

    public int getCommitmentCount() {
        return commitmentCount;
    }

    public void setCommitmentCount(int commitmentCount) {
        this.commitmentCount = commitmentCount;
    }
}
