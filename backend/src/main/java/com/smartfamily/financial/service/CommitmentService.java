package com.smartfamily.financial.service;

import com.smartfamily.financial.dto.CommitmentDto;
import com.smartfamily.financial.dto.CommitmentRequest;
import com.smartfamily.financial.entity.Commitment;
import com.smartfamily.financial.entity.Family;
import com.smartfamily.financial.entity.FamilyMember;
import com.smartfamily.financial.entity.Payment;
import com.smartfamily.financial.entity.User;
import com.smartfamily.financial.exception.BadRequestException;
import com.smartfamily.financial.exception.ResourceNotFoundException;
import com.smartfamily.financial.exception.UnauthorizedException;
import com.smartfamily.financial.repository.CommitmentRepository;
import com.smartfamily.financial.repository.FamilyMemberRepository;
import com.smartfamily.financial.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommitmentService {

    private final CommitmentRepository commitmentRepository;
    private final PaymentRepository paymentRepository;
    private final FamilyService familyService;
    private final FamilyMemberRepository familyMemberRepository;
    private final AuthService authService;

    public CommitmentService(CommitmentRepository commitmentRepository,
                             PaymentRepository paymentRepository,
                             FamilyService familyService,
                             FamilyMemberRepository familyMemberRepository,
                             AuthService authService) {
        this.commitmentRepository = commitmentRepository;
        this.paymentRepository = paymentRepository;
        this.familyService = familyService;
        this.familyMemberRepository = familyMemberRepository;
        this.authService = authService;
    }

    @Transactional
    public CommitmentDto createCommitment(CommitmentRequest request) {
        Family family = familyService.findFamilyAndVerifyOwnership(request.getFamilyId());

        FamilyMember member = null;
        if (request.getFamilyMemberId() != null) {
            member = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("Family member not found"));
            if (!member.getFamily().getId().equals(family.getId())) {
                throw new BadRequestException("Family member does not belong to the specified family");
            }
        }

        Commitment commitment = new Commitment();
        commitment.setTitle(request.getTitle().trim());
        commitment.setType(request.getType());
        commitment.setDescription(request.getDescription());
        commitment.setAmount(request.getAmount());
        commitment.setStartDate(request.getStartDate());
        commitment.setEndDate(request.getEndDate());
        commitment.setFrequency(request.getFrequency());
        commitment.setInterestRate(request.getInterestRate());
        commitment.setFamily(family);
        commitment.setFamilyMember(member);

        int dayOfMonth = (request.getDueDateDay() != null && request.getDueDateDay() >= 1 && request.getDueDateDay() <= 31)
                ? request.getDueDateDay()
                : request.getStartDate().getDayOfMonth();
        commitment.setDueDateDay(dayOfMonth);

        // Calculate total amount if not specified
        int numInstallments = calculateNumberOfInstallments(
                request.getStartDate(),
                request.getEndDate(),
                request.getFrequency(),
                request.getTotalAmount(),
                request.getAmount()
        );

        BigDecimal total = request.getTotalAmount();
        if (total == null || total.compareTo(BigDecimal.ZERO) <= 0) {
            total = request.getAmount().multiply(BigDecimal.valueOf(numInstallments));
        }
        commitment.setTotalAmount(total);
        commitment.setRemainingAmount(total);
        commitment.setStatus("ACTIVE");

        commitment = commitmentRepository.save(commitment);

        // Auto-generate payment schedule
        generateSchedule(commitment, numInstallments, dayOfMonth);

        return toDto(commitment);
    }

    public List<CommitmentDto> getMyCommitments(Long familyId, String status, String type) {
        User user = authService.getCurrentAuthenticatedUser();
        List<Commitment> list;

        if (familyId != null) {
            familyService.findFamilyAndVerifyOwnership(familyId);
            list = commitmentRepository.findByFamilyId(familyId);
        } else {
            list = commitmentRepository.findByFamilyOwnerId(user.getId());
        }

        return list.stream()
                .filter(c -> status == null || status.trim().isEmpty() || c.getStatus().equalsIgnoreCase(status))
                .filter(c -> type == null || type.trim().isEmpty() || c.getType().equalsIgnoreCase(type))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CommitmentDto getCommitmentById(Long id) {
        Commitment commitment = findCommitmentAndVerifyOwnership(id);
        return toDto(commitment);
    }

    @Transactional
    public CommitmentDto updateCommitment(Long id, CommitmentRequest request) {
        Commitment commitment = findCommitmentAndVerifyOwnership(id);

        if (request.getFamilyMemberId() != null) {
            FamilyMember member = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("Family member not found"));
            commitment.setFamilyMember(member);
        } else {
            commitment.setFamilyMember(null);
        }

        commitment.setTitle(request.getTitle().trim());
        commitment.setType(request.getType());
        commitment.setDescription(request.getDescription());
        commitment.setAmount(request.getAmount());
        commitment.setStartDate(request.getStartDate());
        commitment.setEndDate(request.getEndDate());
        commitment.setFrequency(request.getFrequency());
        commitment.setInterestRate(request.getInterestRate());

        if (request.getDueDateDay() != null) {
            commitment.setDueDateDay(request.getDueDateDay());
        }

        if (request.getTotalAmount() != null && request.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
            commitment.setTotalAmount(request.getTotalAmount());
        }

        // Recalculate remaining amount from payments
        List<Payment> payments = paymentRepository.findByCommitmentIdOrderByDueDateAsc(commitment.getId());
        BigDecimal totalPaid = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus()))
                .map(p -> p.getPaidAmount() != null ? p.getPaidAmount() : p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = commitment.getTotalAmount().subtract(totalPaid);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }
        commitment.setRemainingAmount(remaining);

        if (remaining.compareTo(BigDecimal.ZERO) == 0 && totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            commitment.setStatus("COMPLETED");
        }

        commitment = commitmentRepository.save(commitment);
        return toDto(commitment);
    }

    @Transactional
    public void deleteCommitment(Long id) {
        Commitment commitment = findCommitmentAndVerifyOwnership(id);
        commitmentRepository.delete(commitment);
    }

    public Commitment findCommitmentAndVerifyOwnership(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Commitment commitment = commitmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found with id: " + id));

        if (!commitment.getFamily().getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to access this commitment");
        }
        return commitment;
    }

    private int calculateNumberOfInstallments(LocalDate start, LocalDate end, String freq, BigDecimal totalAmount, BigDecimal amount) {
        if ("One-Time".equalsIgnoreCase(freq)) {
            return 1;
        }

        if (end != null && !end.isBefore(start)) {
            long months = java.time.temporal.ChronoUnit.MONTHS.between(start.withDayOfMonth(1), end.withDayOfMonth(1)) + 1;
            int step = getMonthStep(freq);
            return Math.max(1, (int) Math.ceil((double) months / step));
        }

        if (totalAmount != null && amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            return Math.max(1, totalAmount.divide(amount, 0, RoundingMode.CEILING).intValue());
        }

        return 12; // default 12 payments
    }

    private int getMonthStep(String freq) {
        if ("Quarterly".equalsIgnoreCase(freq)) return 3;
        if ("Half-Yearly".equalsIgnoreCase(freq)) return 6;
        if ("Yearly".equalsIgnoreCase(freq)) return 12;
        return 1; // Monthly
    }

    private void generateSchedule(Commitment commitment, int count, int dueDay) {
        List<Payment> schedule = new ArrayList<>();
        LocalDate currentDate = commitment.getStartDate();
        LocalDate today = LocalDate.now();
        int step = getMonthStep(commitment.getFrequency());

        for (int i = 0; i < count; i++) {
            int year = currentDate.getYear();
            int month = currentDate.getMonthValue();
            int maxDayInMonth = currentDate.lengthOfMonth();
            int targetDay = Math.min(dueDay, maxDayInMonth);
            LocalDate dueDate = LocalDate.of(year, month, targetDay);

            Payment payment = new Payment();
            payment.setCommitment(commitment);
            payment.setDueDate(dueDate);
            payment.setAmount(commitment.getAmount());
            payment.setPaidAmount(BigDecimal.ZERO);
            payment.setRemainingAmount(commitment.getAmount());

            if (dueDate.isBefore(today)) {
                payment.setPaymentStatus("OVERDUE");
            } else if (dueDate.isEqual(today)) {
                payment.setPaymentStatus("PENDING");
            } else {
                payment.setPaymentStatus("UPCOMING");
            }

            schedule.add(payment);

            if ("One-Time".equalsIgnoreCase(commitment.getFrequency())) {
                break;
            }
            currentDate = currentDate.plusMonths(step);
        }

        paymentRepository.saveAll(schedule);
    }

    public CommitmentDto toDto(Commitment commitment) {
        CommitmentDto dto = new CommitmentDto();
        dto.setId(commitment.getId());
        dto.setTitle(commitment.getTitle());
        dto.setType(commitment.getType());
        dto.setDescription(commitment.getDescription());
        dto.setAmount(commitment.getAmount());
        dto.setTotalAmount(commitment.getTotalAmount());
        dto.setRemainingAmount(commitment.getRemainingAmount());
        dto.setStartDate(commitment.getStartDate());
        dto.setEndDate(commitment.getEndDate());
        dto.setDueDateDay(commitment.getDueDateDay());
        dto.setFrequency(commitment.getFrequency());
        dto.setInterestRate(commitment.getInterestRate());
        dto.setStatus(commitment.getStatus());
        dto.setCreatedAt(commitment.getCreatedAt());

        if (commitment.getFamily() != null) {
            dto.setFamilyId(commitment.getFamily().getId());
            dto.setFamilyName(commitment.getFamily().getFamilyName());
        }

        if (commitment.getFamilyMember() != null) {
            dto.setFamilyMemberId(commitment.getFamilyMember().getId());
            dto.setFamilyMemberName(commitment.getFamilyMember().getName());
        }

        // Calculate progress from payments
        List<Payment> payments = paymentRepository.findByCommitmentIdOrderByDueDateAsc(commitment.getId());
        dto.setTotalInstallments(payments.size());

        long paidCount = payments.stream().filter(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus())).count();
        dto.setPaidInstallments((int) paidCount);

        BigDecimal paidAmount = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus()))
                .map(p -> p.getPaidAmount() != null ? p.getPaidAmount() : p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setPaidAmount(paidAmount);

        if (commitment.getTotalAmount() != null && commitment.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
            double pct = paidAmount.divide(commitment.getTotalAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            dto.setProgressPercentage(Math.min(100.0, Math.round(pct * 10.0) / 10.0));
        } else {
            dto.setProgressPercentage(0.0);
        }

        return dto;
    }
}
