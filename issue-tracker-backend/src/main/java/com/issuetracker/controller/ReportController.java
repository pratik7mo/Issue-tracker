package com.issuetracker.controller;

import com.issuetracker.dto.DashboardStatsDto;
import com.issuetracker.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final IssueService issueService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardStatsDto> getReportSummary() {
        // Reuse DashboardStatsDto as it contains distributions needed for charts
        return ResponseEntity.ok(issueService.getStats());
    }
}
