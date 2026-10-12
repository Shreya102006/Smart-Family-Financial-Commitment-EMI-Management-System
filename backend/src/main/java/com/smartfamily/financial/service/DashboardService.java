package com.smartfamily.financial.service;

import com.smartfamily.financial.dto.CommitmentTypeStatsDto;
import com.smartfamily.financial.dto.DashboardSummaryDto;
import com.smartfamily.financial.dto.MonthlyStatsDto;
import com.smartfamily.financial.dto.PaymentDto;
import com.smartfamily.financial.entity.Commitment;
import com.smartfamily.financial.entity.Payment;
import com.smartfamily.financial.entity.User;
import com.smartfamily.financial.repository.CommitmentRepository;
import com.smartfamily.financial.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final CommitmentRepository commitmentRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final AuthService authService;

    public DashboardService(CommitmentRepository commitmentRepository,
                            PaymentRepository paymentRepository,
                            PaymentService paymentService,
                            AuthService authService) {
        this.commitmentRepository = commitmentRepository;
        this.paymentRepository = paymentRepository;
        this.paymentService = paymentService;
        this.authService = authService;
    }

    public DashboardSummaryDto getDashboardSummary() {
        paymentService.checkAndUpdateOverdueAndReminders();
        User user = authService.getCurrentAuthenticatedUser();

        List<Commitment> commitments = commitmentRepository.findByFamilyOwnerId(user.getId());
        List<Payment> allPayments = paymentRepository.findByCommitmentFamilyOwnerIdOrderByDueDateAsc(user.getId());

        DashboardSummaryDto summary = new DashboardSummaryDto();

        // 1. Total Monthly Commitments
        BigDecimal totalMonthly = commitments.stream()
                .filter(c -> !"COMPLETED".equalsIgnoreCase(c.getStatus()))
                .map(this::calculateMonthlyEquivalent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalMonthlyCommitments(totalMonthly.setScale(2, RoundingMode.HALF_UP));

        // 2. Total Active Commitments
        long activeCount = commitments.stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()) || "OVERDUE".equalsIgnoreCase(c.getStatus()))
                .count();
        summary.setTotalActiveCommitments(activeCount);

        // 3. Status counts
        long upcomingCount = allPayments.stream().filter(p -> "UPCOMING".equalsIgnoreCase(p.getPaymentStatus())).count();
        long pendingCount = allPayments.stream().filter(p -> "PENDING".equalsIgnoreCase(p.getPaymentStatus())).count();
        long overdueCount = allPayments.stream().filter(p -> "OVERDUE".equalsIgnoreCase(p.getPaymentStatus())).count();
        summary.setUpcomingPaymentsCount(upcomingCount);
        summary.setPendingPaymentsCount(pendingCount);
        summary.setOverduePaymentsCount(overdueCount);

        // 4. Financial totals
        BigDecimal totalPaid = allPayments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus()))
                .map(p -> p.getPaidAmount() != null ? p.getPaidAmount() : p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalPaidAmount(totalPaid.setScale(2, RoundingMode.HALF_UP));

        BigDecimal totalCommitmentAmount = commitments.stream()
                .map(c -> c.getTotalAmount() != null ? c.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalCommitmentAmount(totalCommitmentAmount.setScale(2, RoundingMode.HALF_UP));

        BigDecimal totalRemaining = totalCommitmentAmount.subtract(totalPaid);
        if (totalRemaining.compareTo(BigDecimal.ZERO) < 0) {
            totalRemaining = BigDecimal.ZERO;
        }
        summary.setTotalRemainingAmount(totalRemaining.setScale(2, RoundingMode.HALF_UP));

        if (totalCommitmentAmount.compareTo(BigDecimal.ZERO) > 0) {
            double pct = totalPaid.divide(totalCommitmentAmount, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            summary.setOverallProgressPercentage(Math.min(100.0, Math.round(pct * 10.0) / 10.0));
        } else {
            summary.setOverallProgressPercentage(0.0);
        }

        // 5. Upcoming & Overdue Payments preview
        List<PaymentDto> upcomingList = allPayments.stream()
                .filter(p -> "UPCOMING".equalsIgnoreCase(p.getPaymentStatus()) || "PENDING".equalsIgnoreCase(p.getPaymentStatus()))
                .limit(5)
                .map(paymentService::toDto)
                .collect(Collectors.toList());
        summary.setUpcomingPayments(upcomingList);

        List<PaymentDto> overdueList = allPayments.stream()
                .filter(p -> "OVERDUE".equalsIgnoreCase(p.getPaymentStatus()))
                .map(paymentService::toDto)
                .collect(Collectors.toList());
        summary.setOverduePayments(overdueList);

        // 6. Commitment Type Distribution
        Map<String, BigDecimal> typeDist = new HashMap<>();
        for (Commitment c : commitments) {
            typeDist.put(c.getType(), typeDist.getOrDefault(c.getType(), BigDecimal.ZERO).add(c.getTotalAmount()));
        }
        summary.setCommitmentTypeDistribution(typeDist);

        // 7. Monthly Trends (12 months: 6 months back to 6 months forward)
        summary.setMonthlyTrends(getMonthlyTrendsInternal(allPayments));

        return summary;
    }

    public List<MonthlyStatsDto> getMonthlyTrends() {
        User user = authService.getCurrentAuthenticatedUser();
        List<Payment> allPayments = paymentRepository.findByCommitmentFamilyOwnerIdOrderByDueDateAsc(user.getId());
        return getMonthlyTrendsInternal(allPayments);
    }

    public List<CommitmentTypeStatsDto> getCommitmentTypeStats() {
        User user = authService.getCurrentAuthenticatedUser();
        List<Commitment> commitments = commitmentRepository.findByFamilyOwnerId(user.getId());

        Map<String, List<Commitment>> grouped = commitments.stream()
                .collect(Collectors.groupingBy(Commitment::getType));

        List<CommitmentTypeStatsDto> result = new ArrayList<>();
        for (Map.Entry<String, List<Commitment>> entry : grouped.entrySet()) {
            String type = entry.getKey();
            List<Commitment> list = entry.getValue();

            BigDecimal totalAmount = list.stream().map(Commitment::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal remaining = list.stream().map(Commitment::getRemainingAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal paid = totalAmount.subtract(remaining);
            if (paid.compareTo(BigDecimal.ZERO) < 0) paid = BigDecimal.ZERO;

            result.add(new CommitmentTypeStatsDto(type, list.size(), totalAmount, paid, remaining));
        }

        return result;
    }

    private List<MonthlyStatsDto> getMonthlyTrendsInternal(List<Payment> payments) {
        LocalDate start = LocalDate.now().minusMonths(5).withDayOfMonth(1);
        List<MonthlyStatsDto> trends = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 0; i < 12; i++) {
            LocalDate monthDate = start.plusMonths(i);
            int year = monthDate.getYear();
            int monthVal = monthDate.getMonthValue();
            String label = monthDate.format(formatter);

            BigDecimal committed = BigDecimal.ZERO;
            BigDecimal paid = BigDecimal.ZERO;
            BigDecimal pending = BigDecimal.ZERO;

            for (Payment p : payments) {
                if (p.getDueDate().getYear() == year && p.getDueDate().getMonthValue() == monthVal) {
                    committed = committed.add(p.getAmount());
                    if ("PAID".equalsIgnoreCase(p.getPaymentStatus())) {
                        paid = paid.add(p.getPaidAmount() != null ? p.getPaidAmount() : p.getAmount());
                    } else {
                        pending = pending.add(p.getRemainingAmount() != null ? p.getRemainingAmount() : p.getAmount());
                    }
                }
            }

            trends.add(new MonthlyStatsDto(label, year, monthVal, committed, paid, pending));
        }

        return trends;
    }

    private BigDecimal calculateMonthlyEquivalent(Commitment c) {
        if (c.getAmount() == null) return BigDecimal.ZERO;
        String freq = c.getFrequency();
        if ("Monthly".equalsIgnoreCase(freq)) {
            return c.getAmount();
        } else if ("Quarterly".equalsIgnoreCase(freq)) {
            return c.getAmount().divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
        } else if ("Half-Yearly".equalsIgnoreCase(freq)) {
            return c.getAmount().divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);
        } else if ("Yearly".equalsIgnoreCase(freq)) {
            return c.getAmount().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}
