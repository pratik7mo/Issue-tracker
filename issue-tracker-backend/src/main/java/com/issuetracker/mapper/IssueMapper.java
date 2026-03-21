package com.issuetracker.mapper;

import com.issuetracker.dto.IssueRequestDto;
import com.issuetracker.entity.Issue;
import com.issuetracker.entity.User;
import com.issuetracker.enums.Status;
import org.springframework.stereotype.Component;

@Component
public class IssueMapper {

    public Issue mapToEntity(IssueRequestDto request, User creator, User assignedUser) {
        if (request == null) {
            return null;
        }

        return Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .issueType(request.getIssueType())
                .createdByUser(creator)
                .assignedToUser(assignedUser)
                .status(request.getStatus() != null ? request.getStatus() : Status.OPEN)
                .build();
    }

    public void updateIssueFromRequest(IssueRequestDto request, Issue issue) {
        if (request == null || issue == null) {
            return;
        }

        if (request.getTitle() != null) {
            issue.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            issue.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }
        if (request.getIssueType() != null) {
            issue.setIssueType(request.getIssueType());
        }
        if (request.getStatus() != null) {
            issue.setStatus(request.getStatus());
        }
    }

    public com.issuetracker.dto.IssueResponseDto mapToResponse(Issue issue) {
        if (issue == null) {
            return null;
        }

        return com.issuetracker.dto.IssueResponseDto.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .issueType(issue.getIssueType())
                .createdBy(issue.getCreatedByUser() != null ? issue.getCreatedByUser().getEmail() : null)
                .assignedTo(issue.getAssignedToUser() != null ? issue.getAssignedToUser().getEmail() : null)
                .assignedToUserId(issue.getAssignedToUser() != null ? issue.getAssignedToUser().getId() : null)
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}
