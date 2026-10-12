package com.smartfamily.financial.dto;

import jakarta.validation.constraints.NotBlank;

public class FamilyRequest {

    @NotBlank(message = "Family name is required")
    private String familyName;

    public FamilyRequest() {
    }

    public FamilyRequest(String familyName) {
        this.familyName = familyName;
    }

    public String getFamilyName() {
        return familyName;
    }

    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }
}
