package com.smartfamily.financial.config;

import com.smartfamily.financial.entity.*;
import com.smartfamily.financial.repository.*;
import com.smartfamily.financial.service.PaymentService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final CommitmentRepository commitmentRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository,
                      FamilyRepository familyRepository,
                      FamilyMemberRepository familyMemberRepository,
                      CommitmentRepository commitmentRepository,
                      PaymentRepository paymentRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.commitmentRepository = commitmentRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        System.out.println(">>> Initializing sample data for Aaradhya Family...");

        // 1. Create Demo User
        User demoUser = new User();
        demoUser.setFullName("Rajesh Sharma");
        demoUser.setEmail("demo@smartfamily.com");
        demoUser.setPassword(passwordEncoder.encode("password123"));
        demoUser.setPhone("+91 98765 43210");
        demoUser = userRepository.save(demoUser);

        // 2. Create Family
        Family family = new Family();
        family.setFamilyName("Aaradhya Family");
        family.setOwner(demoUser);
        family = familyRepository.save(family);

        // 3. Create Family Members
        FamilyMember daughter = new FamilyMember(null, "Aaradhya", "Daughter", "aaradhya@example.com", "+91 98765 00001", family, null);
        FamilyMember father = new FamilyMember(null, "Rajesh", "Father", "demo@smartfamily.com", "+91 98765 43210", family, null);
        FamilyMember mother = new FamilyMember(null, "Priya", "Mother", "priya@example.com", "+91 98765 00002", family, null);

        daughter = familyMemberRepository.save(daughter);
        father = familyMemberRepository.save(father);
        mother = familyMemberRepository.save(mother);

        LocalDate today = LocalDate.now();

        // 4. Create Commitments and Schedules
        // Home Loan EMI: ₹25,000/month
        createCommitmentWithSchedule(
                family, father,
                "Home Loan EMI",
                "Home Loan EMI",
                "SBI Home Loan for 3BHK Apartment in Green Glen Layout",
                new BigDecimal("25000"),
                new BigDecimal("300000"),
                today.minusMonths(5).withDayOfMonth(5),
                today.plusMonths(7).withDayOfMonth(5),
                5,
                "Monthly",
                8.4
        );

        // Car EMI: ₹15,000/month
        createCommitmentWithSchedule(
                family, mother,
                "Car Loan EMI",
                "Car Loan EMI",
                "HDFC Car Loan for Hyundai Creta",
                new BigDecimal("15000"),
                new BigDecimal("180000"),
                today.minusMonths(4).withDayOfMonth(10),
                today.plusMonths(8).withDayOfMonth(10),
                10,
                "Monthly",
                8.9
        );

        // Education Fee: ₹50,000/year
        createCommitmentWithSchedule(
                family, daughter,
                "School Annual Tuition Fee",
                "Education Fee",
                "Delhi Public School Annual Academic Fee for Aaradhya",
                new BigDecimal("50000"),
                new BigDecimal("100000"),
                today.minusMonths(2).withDayOfMonth(15),
                today.plusMonths(22).withDayOfMonth(15),
                15,
                "Yearly",
                0.0
        );

        // Insurance Premium: ₹20,000/year
        createCommitmentWithSchedule(
                family, father,
                "Term Life Insurance",
                "Insurance Premium",
                "Max Life 1 Crore Term Insurance Annual Premium",
                new BigDecimal("20000"),
                new BigDecimal("40000"),
                today.minusMonths(1).withDayOfMonth(20),
                today.plusMonths(23).withDayOfMonth(20),
                20,
                "Yearly",
                0.0
        );

        // Rent: ₹12,000/month
        createCommitmentWithSchedule(
                family, father,
                "Apartment Maintenance & Rent",
                "Rent",
                "Monthly Society Rent & Maintenance",
                new BigDecimal("12000"),
                new BigDecimal("144000"),
                today.minusMonths(6).withDayOfMonth(1),
                today.plusMonths(6).withDayOfMonth(1),
                1,
                "Monthly",
                0.0
        );

        // Utility Bill: ₹3,000/month
        createCommitmentWithSchedule(
                family, mother,
                "Electricity & Gas Bill",
                "Utility Bill",
                "BESCOM Electricity and Adani PNG bill",
                new BigDecimal("3000"),
                new BigDecimal("36000"),
                today.minusMonths(6).withDayOfMonth(18),
                today.plusMonths(6).withDayOfMonth(18),
                18,
                "Monthly",
                0.0
        );

        // Create sample notifications
        Notification n1 = new Notification(null, demoUser, null, "Welcome to Smart Family Financial Management System! Your demo dashboard is loaded.", "UPCOMING", false, null);
        Notification n2 = new Notification(null, demoUser, null, "Payment of ₹25,000 for 'Home Loan EMI' is approaching due date.", "UPCOMING", false, null);
        notificationRepository.save(n1);
        notificationRepository.save(n2);

        System.out.println(">>> Sample data successfully loaded for demo@smartfamily.com!");
    }

    private void createCommitmentWithSchedule(Family family, FamilyMember member, String title, String type,
                                              String description, BigDecimal amount, BigDecimal totalAmount,
                                              LocalDate startDate, LocalDate endDate, int dueDay,
                                              String frequency, Double interestRate) {
        Commitment commitment = new Commitment();
        commitment.setFamily(family);
        commitment.setFamilyMember(member);
        commitment.setTitle(title);
        commitment.setType(type);
        commitment.setDescription(description);
        commitment.setAmount(amount);
        commitment.setTotalAmount(totalAmount);
        commitment.setRemainingAmount(totalAmount);
        commitment.setStartDate(startDate);
        commitment.setEndDate(endDate);
        commitment.setDueDateDay(dueDay);
        commitment.setFrequency(frequency);
        commitment.setInterestRate(interestRate);
        commitment.setStatus("ACTIVE");

        commitment = commitmentRepository.save(commitment);

        // Generate payments
        LocalDate current = startDate;
        LocalDate today = LocalDate.now();
        List<Payment> payments = new ArrayList<>();
        BigDecimal totalPaid = BigDecimal.ZERO;

        int stepMonths = 1;
        if ("Quarterly".equalsIgnoreCase(frequency)) stepMonths = 3;
        if ("Half-Yearly".equalsIgnoreCase(frequency)) stepMonths = 6;
        if ("Yearly".equalsIgnoreCase(frequency)) stepMonths = 12;

        while (!current.isAfter(endDate)) {
            int maxDays = current.lengthOfMonth();
            int actualDay = Math.min(dueDay, maxDays);
            LocalDate dueDate = LocalDate.of(current.getYear(), current.getMonthValue(), actualDay);

            Payment payment = new Payment();
            payment.setCommitment(commitment);
            payment.setDueDate(dueDate);
            payment.setAmount(amount);

            if (dueDate.isBefore(today.minusDays(15))) {
                // Paid in the past
                payment.setPaidAmount(amount);
                payment.setRemainingAmount(BigDecimal.ZERO);
                payment.setPaidDate(dueDate);
                payment.setPaymentStatus("PAID");
                totalPaid = totalPaid.add(amount);
            } else if (dueDate.isBefore(today)) {
                // Slightly past due date -> Overdue
                payment.setPaidAmount(BigDecimal.ZERO);
                payment.setRemainingAmount(amount);
                payment.setPaymentStatus("OVERDUE");
            } else if (dueDate.isEqual(today)) {
                payment.setPaidAmount(BigDecimal.ZERO);
                payment.setRemainingAmount(amount);
                payment.setPaymentStatus("PENDING");
            } else {
                payment.setPaidAmount(BigDecimal.ZERO);
                payment.setRemainingAmount(amount);
                payment.setPaymentStatus("UPCOMING");
            }

            payments.add(payment);
            current = current.plusMonths(stepMonths);
        }

        paymentRepository.saveAll(payments);

        BigDecimal remaining = totalAmount.subtract(totalPaid);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;
        commitment.setRemainingAmount(remaining);

        boolean hasOverdue = payments.stream().anyMatch(p -> "OVERDUE".equalsIgnoreCase(p.getPaymentStatus()));
        if (hasOverdue) {
            commitment.setStatus("OVERDUE");
        } else if (remaining.compareTo(BigDecimal.ZERO) == 0 && totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            commitment.setStatus("COMPLETED");
        } else {
            commitment.setStatus("ACTIVE");
        }

        commitmentRepository.save(commitment);
    }
}
