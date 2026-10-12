package com.smartfamily.financial.dto;

import java.math.BigDecimal;

public class MonthlyStatsDto {

    private String month; // e.g. "Jan 2026", "Feb 2026"
    private int year;
    private int monthValue;
    private BigDecimal committedAmount;
    private BigDecimal paidAmount;
    private BigDecimal pendingAmount;

    public MonthlyStatsDto() {
    }

    public MonthlyStatsDto(String month, int year, int monthValue, BigDecimal committedAmount, BigDecimal paidAmount, BigDecimal pendingAmount) {
        this.month = month;
        this.year = year;
        this.monthValue = monthValue;
        this.committedAmount = committedAmount;
        this.paidAmount = paidAmount;
        this.pendingAmount = pendingAmount;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getMonthValue() {
        return monthValue;
    }

    public void setMonthValue(int monthValue) {
        this.monthValue = monthValue;
    }

    public BigDecimal getCommittedAmount() {
        return committedAmount;
    }

    public void setCommittedAmount(BigDecimal committedAmount) {
        this.committedAmount = committedAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getPendingAmount() {
        return pendingAmount;
    }

    public void setPendingAmount(BigDecimal pendingAmount) {
        this.pendingAmount = pendingAmount;
    }
}
