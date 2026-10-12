package com.smartfamily.financial.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {

    private BigDecimal totalMonthlyCommitments;
    private long totalActiveCommitments;
    private long upcomingPaymentsCount;
    private long pendingPaymentsCount;
    private long overduePaymentsCount;
    private BigDecimal totalPaidAmount;
    private BigDecimal totalRemainingAmount;
    private BigDecimal totalCommitmentAmount;
    private double overallProgressPercentage;
    private List<PaymentDto> upcomingPayments;
    private List<PaymentDto> overduePayments;
    private Map<String, BigDecimal> commitmentTypeDistribution;
    private List<MonthlyStatsDto> monthlyTrends;

    public DashboardSummaryDto() {
    }

    public BigDecimal getTotalMonthlyCommitments() {
        return totalMonthlyCommitments;
    }

    public void setTotalMonthlyCommitments(BigDecimal totalMonthlyCommitments) {
        this.totalMonthlyCommitments = totalMonthlyCommitments;
    }

    public long getTotalActiveCommitments() {
        return totalActiveCommitments;
    }

    public void setTotalActiveCommitments(long totalActiveCommitments) {
        this.totalActiveCommitments = totalActiveCommitments;
    }

    public long getUpcomingPaymentsCount() {
        return upcomingPaymentsCount;
    }

    public void setUpcomingPaymentsCount(long upcomingPaymentsCount) {
        this.upcomingPaymentsCount = upcomingPaymentsCount;
    }

    public long getPendingPaymentsCount() {
        return pendingPaymentsCount;
    }

    public void setPendingPaymentsCount(long pendingPaymentsCount) {
        this.pendingPaymentsCount = pendingPaymentsCount;
    }

    public long getOverduePaymentsCount() {
        return overduePaymentsCount;
    }

    public void setOverduePaymentsCount(long overduePaymentsCount) {
        this.overduePaymentsCount = overduePaymentsCount;
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

    public BigDecimal getTotalCommitmentAmount() {
        return totalCommitmentAmount;
    }

    public void setTotalCommitmentAmount(BigDecimal totalCommitmentAmount) {
        this.totalCommitmentAmount = totalCommitmentAmount;
    }

    public double getOverallProgressPercentage() {
        return overallProgressPercentage;
    }

    public void setOverallProgressPercentage(double overallProgressPercentage) {
        this.overallProgressPercentage = overallProgressPercentage;
    }

    public List<PaymentDto> getUpcomingPayments() {
        return upcomingPayments;
    }

    public void setUpcomingPayments(List<PaymentDto> upcomingPayments) {
        this.upcomingPayments = upcomingPayments;
    }

    public List<PaymentDto> getOverduePayments() {
        return overduePayments;
    }

    public void setOverduePayments(List<PaymentDto> overduePayments) {
        this.overduePayments = overduePayments;
    }

    public Map<String, BigDecimal> getCommitmentTypeDistribution() {
        return commitmentTypeDistribution;
    }

    public void setCommitmentTypeDistribution(Map<String, BigDecimal> commitmentTypeDistribution) {
        this.commitmentTypeDistribution = commitmentTypeDistribution;
    }

    public List<MonthlyStatsDto> getMonthlyTrends() {
        return monthlyTrends;
    }

    public void setMonthlyTrends(List<MonthlyStatsDto> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }
}
