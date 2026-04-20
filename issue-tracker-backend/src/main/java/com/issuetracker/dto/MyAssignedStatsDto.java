package com.issuetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MyAssignedStatsDto {
    private long totalAssigned;
    private long openCount;
    private long inProgressCount;
    private long overdueCount;
}
