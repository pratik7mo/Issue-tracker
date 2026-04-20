package com.issuetracker.controller;

import com.issuetracker.dto.IssueRequestDto;
import com.issuetracker.dto.IssueResponseDto;
import com.issuetracker.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping
    public ResponseEntity<IssueResponseDto> createIssue(@RequestBody IssueRequestDto request) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        IssueResponseDto issue = issueService.createIssue(request, email);
        return ResponseEntity.ok(issue);
    }

    @GetMapping
    public ResponseEntity<List<IssueResponseDto>> getAllIssues() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }

    @GetMapping("/stats")
    public ResponseEntity<com.issuetracker.dto.DashboardStatsDto> getStats() {
        return ResponseEntity.ok(issueService.getStats());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalCount() {
        return ResponseEntity.ok(issueService.getTotalIssueCount());
    }

    @GetMapping("/inprogress/count")
    public ResponseEntity<Long> getInProgressCount() {
        return ResponseEntity.ok(issueService.getInProgressIssueCount());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueResponseDto> getIssue(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    @GetMapping("/assigned/{userId}")
    public ResponseEntity<List<IssueResponseDto>> getAssignedIssues(@PathVariable Long userId) {
        return ResponseEntity.ok(issueService.getIssuesAssignedToUser(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueResponseDto> updateIssue(@PathVariable Long id,
                                              @RequestBody IssueRequestDto request) {
        IssueResponseDto issue = issueService.updateIssue(id, request);
        return ResponseEntity.ok(issue);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Issue deleted successfully"));
    }
    @GetMapping("/leaderboard")
    public ResponseEntity<java.util.List<com.issuetracker.dto.UserLeaderboardDto>> getLeaderboard() {
        return ResponseEntity.ok(issueService.getLeaderboard());
    }
}
