package com.smartfamily.financial.dto;

import java.time.LocalDateTime;

public class FamilyMemberDto {

    private Long id;
    private String name;
    private String relationship;
    private String email;
    private String phone;
    private Long familyId;
    private String familyName;
    private LocalDateTime createdAt;
    private int commitmentCount;

    public FamilyMemberDto() {
    }

    public FamilyMemberDto(Long id, String name, String relationship, String email, String phone, Long familyId, String familyName, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.relationship = relationship;
        this.email = email;
        this.phone = phone;
        this.familyId = familyId;
        this.familyName = familyName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getFamilyId() {
        return familyId;
    }

    public void setFamilyId(Long familyId) {
        this.familyId = familyId;
    }

    public String getFamilyName() {
        return familyName;
    }

    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getCommitmentCount() {
        return commitmentCount;
    }

    public void setCommitmentCount(int commitmentCount) {
        this.commitmentCount = commitmentCount;
    }
}
