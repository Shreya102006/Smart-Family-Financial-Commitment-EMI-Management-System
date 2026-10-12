package com.smartfamily.financial.service;

import com.smartfamily.financial.dto.CommitmentTypeStatsDto;
import com.smartfamily.financial.dto.MemberReportDto;
import com.smartfamily.financial.dto.MonthlyStatsDto;
import com.smartfamily.financial.dto.ReportSummaryDto;
import com.smartfamily.financial.entity.Commitment;
import com.smartfamily.financial.entity.FamilyMember;
import com.smartfamily.financial.entity.Payment;
import com.smartfamily.financial.entity.User;
import com.smartfamily.financial.repository.CommitmentRepository;
import com.smartfamily.financial.repository.FamilyMemberRepository;
import com.smartfamily.financial.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final CommitmentRepository commitmentRepository;
    private final PaymentRepository paymentRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final DashboardService dashboardService;
    private final AuthService authService;

    public ReportService(CommitmentRepository commitmentRepository,
                         PaymentRepository paymentRepository,
                         FamilyMemberRepository familyMemberRepository,
                         DashboardService dashboardService,
                         AuthService authService) {
        this.commitmentRepository = commitmentRepository;
        this.paymentRepository = paymentRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.dashboardService = dashboardService;
        this.authService = authService;
    }

    public ReportSummaryDto getReportSummary(Integer year, Integer month, String commitmentType, Long memberId) {
        User user = authService.getCurrentAuthenticatedUser();
        List<Commitment> commitments = commitmentRepository.findByFamilyOwnerId(user.getId());
        List<Payment> payments = paymentRepository.findByCommitmentFamilyOwnerIdOrderByDueDateAsc(user.getId());

        // Filter commitments
        List<Commitment> filteredCommitments = commitments.stream()
                .filter(c -> commitmentType == null || commitmentType.trim().isEmpty() || c.getType().equalsIgnoreCase(commitmentType))
                .filter(c -> memberId == null || (c.getFamilyMember() != null && c.getFamilyMember().getId().equals(memberId)))
                .collect(Collectors.toList());

        // Filter payments
        List<Payment> filteredPayments = payments.stream()
                .filter(p -> commitmentType == null || commitmentType.trim().isEmpty() || p.getCommitment().getType().equalsIgnoreCase(commitmentType))
                .filter(p -> memberId == null || (p.getCommitment().getFamilyMember() != null && p.getCommitment().getFamilyMember().getId().equals(memberId)))
                .filter(p -> year == null || p.getDueDate().getYear() == year)
                .filter(p -> month == null || p.getDueDate().getMonthValue() == month)
                .collect(Collectors.toList());

        ReportSummaryDto report = new ReportSummaryDto();

        BigDecimal totalCommitmentsAmount = filteredCommitments.stream()
                .map(c -> c.getTotalAmount() != null ? c.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.setTotalCommitmentsAmount(totalCommitmentsAmount.setScale(2, RoundingMode.HALF_UP));

        BigDecimal monthlyTotal = filteredCommitments.stream()
                .map(this::calculateMonthlyEquivalent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.setMonthlyCommitmentsAmount(monthlyTotal.setScale(2, RoundingMode.HALF_UP));

        BigDecimal totalPaid = filteredPayments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus()))
                .map(p -> p.getPaidAmount() != null ? p.getPaidAmount() : p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.setTotalPaidAmount(totalPaid.setScale(2, RoundingMode.HALF_UP));

        BigDecimal totalRemaining = totalCommitmentsAmount.subtract(totalPaid);
        if (totalRemaining.compareTo(BigDecimal.ZERO) < 0) totalRemaining = BigDecimal.ZERO;
        report.setTotalRemainingAmount(totalRemaining.setScale(2, RoundingMode.HALF_UP));

        BigDecimal overdueAmount = filteredPayments.stream()
                .filter(p -> "OVERDUE".equalsIgnoreCase(p.getPaymentStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.setTotalOverdueAmount(overdueAmount.setScale(2, RoundingMode.HALF_UP));

        report.setTotalCommitmentCount(filteredCommitments.size());
        report.setTotalPaymentsCount(filteredPayments.size());
        report.setOverduePaymentsCount(filteredPayments.stream().filter(p -> "OVERDUE".equalsIgnoreCase(p.getPaymentStatus())).count());

        report.setTypeDistribution(dashboardService.getCommitmentTypeStats());
        report.setMemberReports(getMemberReports());
        report.setMonthlyBreakdown(dashboardService.getMonthlyTrends());

        return report;
    }

    public List<MemberReportDto> getMemberReports() {
        User user = authService.getCurrentAuthenticatedUser();
        List<FamilyMember> members = familyMemberRepository.findByFamilyOwnerId(user.getId());
        List<Commitment> commitments = commitmentRepository.findByFamilyOwnerId(user.getId());
        List<Payment> payments = paymentRepository.findByCommitmentFamilyOwnerIdOrderByDueDateAsc(user.getId());

        List<MemberReportDto> reports = new ArrayList<>();

        for (FamilyMember member : members) {
            List<Commitment> memberCommitments = commitments.stream()
                    .filter(c -> c.getFamilyMember() != null && c.getFamilyMember().getId().equals(member.getId()))
                    .collect(Collectors.toList());

            BigDecimal totalAmount = memberCommitments.stream()
                    .map(Commitment::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal paidAmount = payments.stream()
                    .filter(p -> p.getCommitment().getFamilyMember() != null && p.getCommitment().getFamilyMember().getId().equals(member.getId()))
                    .filter(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus()))
                    .map(p -> p.getPaidAmount() != null ? p.getPaidAmount() : p.getAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal remaining = totalAmount.subtract(paidAmount);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;

            double progress = 0.0;
            if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
                progress = paidAmount.divide(totalAmount, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
                progress = Math.min(100.0, Math.round(progress * 10.0) / 10.0);
            }

            reports.add(new MemberReportDto(
                    member.getId(),
                    member.getName(),
                    member.getRelationship(),
                    memberCommitments.size(),
                    totalAmount,
                    paidAmount,
                    remaining,
                    progress
            ));
        }

        return reports;
    }

    private BigDecimal calculateMonthlyEquivalent(Commitment c) {
        if (c.getAmount() == null) return BigDecimal.ZERO;
        String freq = c.getFrequency();
        if ("Monthly".equalsIgnoreCase(freq)) return c.getAmount();
        if ("Quarterly".equalsIgnoreCase(freq)) return c.getAmount().divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
        if ("Half-Yearly".equalsIgnoreCase(freq)) return c.getAmount().divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);
        if ("Yearly".equalsIgnoreCase(freq)) return c.getAmount().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        return BigDecimal.ZERO;
    }
}
