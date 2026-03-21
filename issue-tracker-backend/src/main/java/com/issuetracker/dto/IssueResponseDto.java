package com.issuetracker.dto;


import com.issuetracker.enums.Priority;
import com.issuetracker.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IssueResponseDto {
    private Long id;
    private String title;
    private String description;
    private Status status;
    private Priority priority;
    private com.issuetracker.enums.IssueType issueType;
    private String createdBy; // Email or Name
    private String assignedTo; // Email or Name
    private Long assignedToUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
