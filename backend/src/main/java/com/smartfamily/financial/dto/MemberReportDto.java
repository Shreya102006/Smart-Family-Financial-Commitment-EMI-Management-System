package com.smartfamily.financial.dto;

import java.math.BigDecimal;

public class MemberReportDto {

    private Long memberId;
    private String memberName;
    private String relationship;
    private long commitmentCount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private double progressPercentage;

    public MemberReportDto() {
    }

    public MemberReportDto(Long memberId, String memberName, String relationship, long commitmentCount, BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal remainingAmount, double progressPercentage) {
        this.memberId = memberId;
        this.memberName = memberName;
        this.relationship = relationship;
        this.commitmentCount = commitmentCount;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.remainingAmount = remainingAmount;
        this.progressPercentage = progressPercentage;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public String getMemberName() {
        return memberName;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }

    public long getCommitmentCount() {
        return commitmentCount;
    }

    public void setCommitmentCount(long commitmentCount) {
        this.commitmentCount = commitmentCount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}
