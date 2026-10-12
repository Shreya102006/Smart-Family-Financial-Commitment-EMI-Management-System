package com.smartfamily.financial.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class NotificationDto {

    private Long id;
    private String message;
    private String notificationType;
    private Boolean isRead;
    private Long paymentId;
    private String commitmentTitle;
    private LocalDate dueDate;
    private LocalDateTime createdAt;

    public NotificationDto() {
    }

    public NotificationDto(Long id, String message, String notificationType, Boolean isRead, Long paymentId, String commitmentTitle, LocalDate dueDate, LocalDateTime createdAt) {
        this.id = id;
        this.message = message;
        this.notificationType = notificationType;
        this.isRead = isRead;
        this.paymentId = paymentId;
        this.commitmentTitle = commitmentTitle;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getCommitmentTitle() {
        return commitmentTitle;
    }

    public void setCommitmentTitle(String commitmentTitle) {
        this.commitmentTitle = commitmentTitle;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
