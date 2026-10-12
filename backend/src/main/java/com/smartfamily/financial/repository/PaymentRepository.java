package com.smartfamily.financial.repository;

import com.smartfamily.financial.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByCommitmentIdOrderByDueDateAsc(Long commitmentId);

    List<Payment> findByCommitmentFamilyOwnerIdOrderByDueDateAsc(Long ownerId);

    List<Payment> findByCommitmentFamilyOwnerIdOrderByDueDateDesc(Long ownerId);

    List<Payment> findByCommitmentFamilyOwnerIdAndPaymentStatusOrderByDueDateAsc(Long ownerId, String paymentStatus);

    List<Payment> findByCommitmentFamilyOwnerIdAndPaymentStatusOrderByPaidDateDesc(Long ownerId, String paymentStatus);

    List<Payment> findByCommitmentFamilyOwnerIdAndPaymentStatusInOrderByDueDateAsc(Long ownerId, List<String> statuses);

    long countByCommitmentFamilyOwnerIdAndPaymentStatus(Long ownerId, String paymentStatus);

    @Query("SELECT p FROM Payment p WHERE p.paymentStatus != 'PAID' AND p.dueDate < :currentDate")
    List<Payment> findOverduePayments(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT p FROM Payment p WHERE p.paymentStatus != 'PAID' AND p.dueDate BETWEEN :startDate AND :endDate")
    List<Payment> findPaymentsDueBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
