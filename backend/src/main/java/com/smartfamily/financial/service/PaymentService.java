package com.smartfamily.financial.service;

import com.smartfamily.financial.dto.PayRequest;
import com.smartfamily.financial.dto.PaymentDto;
import com.smartfamily.financial.entity.Commitment;
import com.smartfamily.financial.entity.Payment;
import com.smartfamily.financial.entity.User;
import com.smartfamily.financial.exception.BadRequestException;
import com.smartfamily.financial.exception.ResourceNotFoundException;
import com.smartfamily.financial.exception.UnauthorizedException;
import com.smartfamily.financial.repository.CommitmentRepository;
import com.smartfamily.financial.repository.PaymentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CommitmentRepository commitmentRepository;
    private final NotificationService notificationService;
    private final AuthService authService;

    public PaymentService(PaymentRepository paymentRepository,
                          CommitmentRepository commitmentRepository,
                          NotificationService notificationService,
                          AuthService authService) {
        this.paymentRepository = paymentRepository;
        this.commitmentRepository = commitmentRepository;
        this.notificationService = notificationService;
        this.authService = authService;
    }

    public List<PaymentDto> getPaymentsByCommitment(Long commitmentId) {
        checkAndUpdateOverdueAndReminders();
        User user = authService.getCurrentAuthenticatedUser();
        Commitment commitment = commitmentRepository.findById(commitmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found"));

        if (!commitment.getFamily().getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to view payments for this commitment");
        }

        return paymentRepository.findByCommitmentIdOrderByDueDateAsc(commitmentId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<PaymentDto> getAllPayments(String status, Long familyId, Long memberId) {
        checkAndUpdateOverdueAndReminders();
        User user = authService.getCurrentAuthenticatedUser();
        List<Payment> list = paymentRepository.findByCommitmentFamilyOwnerIdOrderByDueDateAsc(user.getId());

        return list.stream()
                .filter(p -> status == null || status.trim().isEmpty() || p.getPaymentStatus().equalsIgnoreCase(status))
                .filter(p -> familyId == null || p.getCommitment().getFamily().getId().equals(familyId))
                .filter(p -> memberId == null || (p.getCommitment().getFamilyMember() != null && p.getCommitment().getFamilyMember().getId().equals(memberId)))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<PaymentDto> getUpcomingPayments() {
        checkAndUpdateOverdueAndReminders();
        User user = authService.getCurrentAuthenticatedUser();
        List<Payment> list = paymentRepository.findByCommitmentFamilyOwnerIdAndPaymentStatusInOrderByDueDateAsc(
                user.getId(), List.of("UPCOMING", "PENDING")
        );
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<PaymentDto> getPendingPayments() {
        checkAndUpdateOverdueAndReminders();
        User user = authService.getCurrentAuthenticatedUser();
        return paymentRepository.findByCommitmentFamilyOwnerIdAndPaymentStatusOrderByDueDateAsc(user.getId(), "PENDING").stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<PaymentDto> getOverduePayments() {
        checkAndUpdateOverdueAndReminders();
        User user = authService.getCurrentAuthenticatedUser();
        return paymentRepository.findByCommitmentFamilyOwnerIdAndPaymentStatusOrderByDueDateAsc(user.getId(), "OVERDUE").stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<PaymentDto> getPaymentHistory() {
        checkAndUpdateOverdueAndReminders();
        User user = authService.getCurrentAuthenticatedUser();
        List<Payment> list = paymentRepository.findByCommitmentFamilyOwnerIdOrderByDueDateDesc(user.getId());

        // Sort by paidDate desc if paid, or dueDate desc
        return list.stream()
                .sorted(Comparator.comparing(
                        (Payment p) -> p.getPaidDate() != null ? p.getPaidDate() : p.getDueDate()
                ).reversed())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentDto markPaymentAsPaid(Long paymentId, PayRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with id: " + paymentId));

        Commitment commitment = payment.getCommitment();
        if (!commitment.getFamily().getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to modify this payment");
        }

        if ("PAID".equalsIgnoreCase(payment.getPaymentStatus())) {
            throw new BadRequestException("This payment has already been marked as PAID");
        }

        BigDecimal payingAmount = (request != null && request.getPaidAmount() != null && request.getPaidAmount().compareTo(BigDecimal.ZERO) > 0)
                ? request.getPaidAmount()
                : (payment.getRemainingAmount() != null && payment.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0
                ? payment.getRemainingAmount()
                : payment.getAmount());

        LocalDate paidDate = (request != null && request.getPaidDate() != null)
                ? request.getPaidDate()
                : LocalDate.now();

        payment.setPaidAmount(payingAmount);
        payment.setRemainingAmount(BigDecimal.ZERO);
        payment.setPaidDate(paidDate);
        payment.setPaymentStatus("PAID");
        payment = paymentRepository.save(payment);

        // Update commitment remaining amount and status
        List<Payment> allPayments = paymentRepository.findByCommitmentIdOrderByDueDateAsc(commitment.getId());
        BigDecimal totalPaidSoFar = allPayments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus()))
                .map(p -> p.getPaidAmount() != null ? p.getPaidAmount() : p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal newRemaining = commitment.getTotalAmount().subtract(totalPaidSoFar);
        if (newRemaining.compareTo(BigDecimal.ZERO) < 0) {
            newRemaining = BigDecimal.ZERO;
        }
        commitment.setRemainingAmount(newRemaining);

        // Check if all payments are paid or remaining amount is 0
        boolean allPaid = allPayments.stream().allMatch(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus()));
        if (allPaid || newRemaining.compareTo(BigDecimal.ZERO) == 0) {
            commitment.setStatus("COMPLETED");
        } else {
            // Check if there are still overdue payments
            boolean hasOverdue = allPayments.stream().anyMatch(p -> "OVERDUE".equalsIgnoreCase(p.getPaymentStatus()));
            commitment.setStatus(hasOverdue ? "OVERDUE" : "ACTIVE");
        }
        commitmentRepository.save(commitment);

        // Create success notification
        String message = String.format("Payment of Rs. %s for '%s' was recorded successfully on %s",
                payingAmount.toPlainString(), commitment.getTitle(), paidDate);
        notificationService.createNotification(user, payment, message, "PAYMENT_SUCCESS");

        return toDto(payment);
    }

    @Scheduled(fixedRate = 3600000) // hourly auto-check
    @Transactional
    public void scheduledOverdueAndReminderCheck() {
        checkAndUpdateOverdueAndReminders();
    }

    @Transactional
    public void checkAndUpdateOverdueAndReminders() {
        LocalDate today = LocalDate.now();

        // 1. Process Overdue Payments (currentDate > dueDate AND status != PAID)
        List<Payment> overduePayments = paymentRepository.findOverduePayments(today);
        for (Payment payment : overduePayments) {
            if (!"OVERDUE".equalsIgnoreCase(payment.getPaymentStatus())) {
                payment.setPaymentStatus("OVERDUE");
                paymentRepository.save(payment);

                Commitment commitment = payment.getCommitment();
                if ("ACTIVE".equalsIgnoreCase(commitment.getStatus())) {
                    commitment.setStatus("OVERDUE");
                    commitmentRepository.save(commitment);
                }

                User owner = commitment.getFamily().getOwner();
                String message = String.format("Payment of Rs. %s for '%s' is OVERDUE (Due: %s)",
                        payment.getAmount().toPlainString(), commitment.getTitle(), payment.getDueDate());
                notificationService.createNotification(owner, payment, message, "OVERDUE");
            }
        }

        // 2. Process Reminders for Upcoming & Today Payments (next 7 days)
        List<Payment> upcomingList = paymentRepository.findPaymentsDueBetween(today, today.plusDays(7));
        for (Payment payment : upcomingList) {
            Commitment commitment = payment.getCommitment();
            User owner = commitment.getFamily().getOwner();
            LocalDate dueDate = payment.getDueDate();
            long daysUntil = ChronoUnit.DAYS.between(today, dueDate);

            if (daysUntil == 0) {
                if (!"PENDING".equalsIgnoreCase(payment.getPaymentStatus())) {
                    payment.setPaymentStatus("PENDING");
                    paymentRepository.save(payment);
                }
                String msg = String.format("Payment of Rs. %s for '%s' is due TODAY!",
                        payment.getAmount().toPlainString(), commitment.getTitle());
                notificationService.createNotification(owner, payment, msg, "DUE_TODAY");
            } else if (daysUntil == 1) {
                String msg = String.format("Payment of Rs. %s for '%s' is due tomorrow (%s)",
                        payment.getAmount().toPlainString(), commitment.getTitle(), dueDate);
                notificationService.createNotification(owner, payment, msg, "UPCOMING");
            } else if (daysUntil == 3) {
                String msg = String.format("Payment of Rs. %s for '%s' is due in 3 days (%s)",
                        payment.getAmount().toPlainString(), commitment.getTitle(), dueDate);
                notificationService.createNotification(owner, payment, msg, "UPCOMING");
            } else if (daysUntil == 7) {
                String msg = String.format("Payment of Rs. %s for '%s' is due in 7 days (%s)",
                        payment.getAmount().toPlainString(), commitment.getTitle(), dueDate);
                notificationService.createNotification(owner, payment, msg, "UPCOMING");
            }
        }
    }

    public PaymentDto toDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        dto.setDueDate(payment.getDueDate());
        dto.setAmount(payment.getAmount());
        dto.setPaidAmount(payment.getPaidAmount());
        dto.setRemainingAmount(payment.getRemainingAmount());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setPaidDate(payment.getPaidDate());
        dto.setCreatedAt(payment.getCreatedAt());

        LocalDate today = LocalDate.now();
        if (payment.getDueDate() != null) {
            dto.setDaysRemaining(ChronoUnit.DAYS.between(today, payment.getDueDate()));
        }

        if (payment.getCommitment() != null) {
            Commitment c = payment.getCommitment();
            dto.setCommitmentId(c.getId());
            dto.setCommitmentTitle(c.getTitle());
            dto.setCommitmentType(c.getType());
            dto.setFrequency(c.getFrequency());

            if (c.getFamily() != null) {
                dto.setFamilyId(c.getFamily().getId());
                dto.setFamilyName(c.getFamily().getFamilyName());
            }

            if (c.getFamilyMember() != null) {
                dto.setFamilyMemberId(c.getFamilyMember().getId());
                dto.setFamilyMemberName(c.getFamilyMember().getName());
            }
        }

        return dto;
    }
}
