package com.smartfamily.financial.service;

import com.smartfamily.financial.dto.NotificationDto;
import com.smartfamily.financial.entity.Notification;
import com.smartfamily.financial.entity.Payment;
import com.smartfamily.financial.entity.User;
import com.smartfamily.financial.exception.ResourceNotFoundException;
import com.smartfamily.financial.exception.UnauthorizedException;
import com.smartfamily.financial.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    public NotificationService(NotificationRepository notificationRepository, AuthService authService) {
        this.notificationRepository = notificationRepository;
        this.authService = authService;
    }

    public List<NotificationDto> getMyNotifications(Boolean unreadOnly) {
        User user = authService.getCurrentAuthenticatedUser();
        List<Notification> list;
        if (Boolean.TRUE.equals(unreadOnly)) {
            list = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        } else {
            list = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    public long getUnreadCount() {
        User user = authService.getCurrentAuthenticatedUser();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public NotificationDto markAsRead(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to view this notification");
        }

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return toDto(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User user = authService.getCurrentAuthenticatedUser();
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public Notification createNotification(User user, Payment payment, String message, String type) {
        // Prevent duplicate notifications of same type for the same payment
        if (payment != null && notificationRepository.existsByUserIdAndPaymentIdAndNotificationType(user.getId(), payment.getId(), type)) {
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setPayment(payment);
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    public NotificationDto toDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setNotificationType(notification.getNotificationType());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());

        if (notification.getPayment() != null) {
            dto.setPaymentId(notification.getPayment().getId());
            dto.setDueDate(notification.getPayment().getDueDate());
            if (notification.getPayment().getCommitment() != null) {
                dto.setCommitmentTitle(notification.getPayment().getCommitment().getTitle());
            }
        }
        return dto;
    }
}
