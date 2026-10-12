package com.smartfamily.financial.controller;

import com.smartfamily.financial.dto.PayRequest;
import com.smartfamily.financial.dto.PaymentDto;
import com.smartfamily.financial.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments(
            @RequestParam(required = false) Long commitmentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long familyId,
            @RequestParam(required = false) Long memberId) {

        if (commitmentId != null) {
            return ResponseEntity.ok(paymentService.getPaymentsByCommitment(commitmentId));
        }
        return ResponseEntity.ok(paymentService.getAllPayments(status, familyId, memberId));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<PaymentDto>> getUpcomingPayments() {
        return ResponseEntity.ok(paymentService.getUpcomingPayments());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PaymentDto>> getPendingPayments() {
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<PaymentDto>> getOverduePayments() {
        return ResponseEntity.ok(paymentService.getOverduePayments());
    }

    @GetMapping("/history")
    public ResponseEntity<List<PaymentDto>> getPaymentHistory() {
        return ResponseEntity.ok(paymentService.getPaymentHistory());
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<PaymentDto> markAsPaid(
            @PathVariable Long id,
            @RequestBody(required = false) PayRequest request) {
        return ResponseEntity.ok(paymentService.markPaymentAsPaid(id, request));
    }
}
