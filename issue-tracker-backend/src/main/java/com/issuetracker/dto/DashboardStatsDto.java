package com.issuetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDto {
    private long totalIssues;
    private long inProgressIssues;
    private long resolvedIssues;
    private long highPriorityIssues;
    private java.util.Map<String, Long> typeDistribution;
    private java.util.Map<String, Long> statusDistribution;
}
