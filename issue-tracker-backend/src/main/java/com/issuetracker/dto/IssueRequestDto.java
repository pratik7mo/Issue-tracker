package com.issuetracker.dto;

import com.issuetracker.enums.Priority;
import lombok.Data;

@Data
public class IssueRequestDto {

    private String title;
    private String description;
    private Priority priority;
    private com.issuetracker.enums.IssueType issueType;
    private com.issuetracker.enums.Status status;

    private Long assignedToUserId;
}
