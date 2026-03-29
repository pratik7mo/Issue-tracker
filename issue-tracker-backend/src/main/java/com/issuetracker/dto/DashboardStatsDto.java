package com.issuetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDto {
    private long totalIssues;
    private long openIssues;
    private long inProgressIssues;
    private long resolvedIssues;
    private long highPriorityIssues;
    private long overdueIssues;
    private long criticalIssues;
    private long unassignedIssues;

    private Map<String, Long> typeDistribution;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> priorityDistribution;

    private MyAssignedStatsDto myAssignedIssues;
    private List<ActivityDto> recentActivity;
    private List<IssueResponseDto> recentlyCreatedIssues;
}
