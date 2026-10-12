package com.smartfamily.financial.dto;

import java.math.BigDecimal;
import java.util.List;

public class ReportSummaryDto {

    private BigDecimal totalCommitmentsAmount;
    private BigDecimal monthlyCommitmentsAmount;
    private BigDecimal totalPaidAmount;
    private BigDecimal totalRemainingAmount;
    private BigDecimal totalOverdueAmount;
    private long totalCommitmentCount;
    private long totalPaymentsCount;
    private long overduePaymentsCount;
    private List<CommitmentTypeStatsDto> typeDistribution;
    private List<MemberReportDto> memberReports;
    private List<MonthlyStatsDto> monthlyBreakdown;

    public ReportSummaryDto() {
    }

    public BigDecimal getTotalCommitmentsAmount() {
        return totalCommitmentsAmount;
    }

    public void setTotalCommitmentsAmount(BigDecimal totalCommitmentsAmount) {
        this.totalCommitmentsAmount = totalCommitmentsAmount;
    }

    public BigDecimal getMonthlyCommitmentsAmount() {
        return monthlyCommitmentsAmount;
    }

    public void setMonthlyCommitmentsAmount(BigDecimal monthlyCommitmentsAmount) {
        this.monthlyCommitmentsAmount = monthlyCommitmentsAmount;
    }

    public BigDecimal getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    public BigDecimal getTotalRemainingAmount() {
        return totalRemainingAmount;
    }

    public void setTotalRemainingAmount(BigDecimal totalRemainingAmount) {
        this.totalRemainingAmount = totalRemainingAmount;
    }

    public BigDecimal getTotalOverdueAmount() {
        return totalOverdueAmount;
    }

    public void setTotalOverdueAmount(BigDecimal totalOverdueAmount) {
        this.totalOverdueAmount = totalOverdueAmount;
    }

    public long getTotalCommitmentCount() {
        return totalCommitmentCount;
    }

    public void setTotalCommitmentCount(long totalCommitmentCount) {
        this.totalCommitmentCount = totalCommitmentCount;
    }

    public long getTotalPaymentsCount() {
        return totalPaymentsCount;
    }

    public void setTotalPaymentsCount(long totalPaymentsCount) {
        this.totalPaymentsCount = totalPaymentsCount;
    }

    public long getOverduePaymentsCount() {
        return overduePaymentsCount;
    }

    public void setOverduePaymentsCount(long overduePaymentsCount) {
        this.overduePaymentsCount = overduePaymentsCount;
    }

    public List<CommitmentTypeStatsDto> getTypeDistribution() {
        return typeDistribution;
    }

    public void setTypeDistribution(List<CommitmentTypeStatsDto> typeDistribution) {
        this.typeDistribution = typeDistribution;
    }

    public List<MemberReportDto> getMemberReports() {
        return memberReports;
    }

    public void setMemberReports(List<MemberReportDto> memberReports) {
        this.memberReports = memberReports;
    }

    public List<MonthlyStatsDto> getMonthlyBreakdown() {
        return monthlyBreakdown;
    }

    public void setMonthlyBreakdown(List<MonthlyStatsDto> monthlyBreakdown) {
        this.monthlyBreakdown = monthlyBreakdown;
    }
}
