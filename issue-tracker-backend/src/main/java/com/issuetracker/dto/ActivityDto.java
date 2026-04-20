package com.issuetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityDto {
    private String icon;
    private Long issueId;
    private String action; // Created, Assigned, Status Updated, Priority Changed, Resolved
    private LocalDateTime time;
}
