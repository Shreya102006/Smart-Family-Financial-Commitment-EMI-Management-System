package com.smartfamily.financial.controller;

import com.smartfamily.financial.dto.CommitmentTypeStatsDto;
import com.smartfamily.financial.dto.DashboardSummaryDto;
import com.smartfamily.financial.dto.MonthlyStatsDto;
import com.smartfamily.financial.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyStatsDto>> getMonthly() {
        return ResponseEntity.ok(dashboardService.getMonthlyTrends());
    }

    @GetMapping("/commitment-types")
    public ResponseEntity<List<CommitmentTypeStatsDto>> getCommitmentTypes() {
        return ResponseEntity.ok(dashboardService.getCommitmentTypeStats());
    }
}
