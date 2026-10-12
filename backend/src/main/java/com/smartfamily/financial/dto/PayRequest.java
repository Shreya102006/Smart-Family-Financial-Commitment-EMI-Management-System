package com.smartfamily.financial.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PayRequest {

    private BigDecimal paidAmount;
    private LocalDate paidDate;
    private String paymentMethod;
    private String notes;

    public PayRequest() {
    }

    public PayRequest(BigDecimal paidAmount, LocalDate paidDate, String paymentMethod, String notes) {
        this.paidAmount = paidAmount;
        this.paidDate = paidDate;
        this.paymentMethod = paymentMethod;
        this.notes = notes;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
