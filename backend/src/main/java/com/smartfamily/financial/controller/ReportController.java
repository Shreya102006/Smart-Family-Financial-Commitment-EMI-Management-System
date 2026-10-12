package com.smartfamily.financial.controller;

import com.smartfamily.financial.dto.MemberReportDto;
import com.smartfamily.financial.dto.MonthlyStatsDto;
import com.smartfamily.financial.dto.ReportSummaryDto;
import com.smartfamily.financial.service.DashboardService;
import com.smartfamily.financial.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final DashboardService dashboardService;

    public ReportController(ReportService reportService, DashboardService dashboardService) {
        this.reportService = reportService;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ReportSummaryDto> getSummary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String commitmentType,
            @RequestParam(required = false) Long memberId) {
        return ResponseEntity.ok(reportService.getReportSummary(year, month, commitmentType, memberId));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyStatsDto>> getMonthly() {
        return ResponseEntity.ok(dashboardService.getMonthlyTrends());
    }

    @GetMapping("/member-wise")
    public ResponseEntity<List<MemberReportDto>> getMemberWise() {
        return ResponseEntity.ok(reportService.getMemberReports());
    }
}
