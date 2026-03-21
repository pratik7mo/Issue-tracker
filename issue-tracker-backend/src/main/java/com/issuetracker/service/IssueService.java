package com.issuetracker.service;

import com.issuetracker.dto.IssueRequestDto;
import com.issuetracker.dto.IssueResponseDto;
import java.util.List;

public interface IssueService {
    IssueResponseDto createIssue(IssueRequestDto request, String email);
    List<IssueResponseDto> getAllIssues();
    IssueResponseDto getIssueById(Long id);
    List<IssueResponseDto> getIssuesAssignedToUser(Long userId);
    IssueResponseDto updateIssue(Long id, IssueRequestDto request);
    void deleteIssue(Long id);
    com.issuetracker.dto.DashboardStatsDto getStats();
    long getTotalIssueCount();
    long getInProgressIssueCount();
    java.util.List<com.issuetracker.dto.UserLeaderboardDto> getLeaderboard();
}
