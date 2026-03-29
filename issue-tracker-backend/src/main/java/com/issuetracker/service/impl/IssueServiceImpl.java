package com.issuetracker.service.impl;

import com.issuetracker.dto.IssueRequestDto;
import com.issuetracker.dto.IssueResponseDto;
import com.issuetracker.entity.*;
import com.issuetracker.repo.IssueRepository;
import com.issuetracker.repo.UserRepository;
import com.issuetracker.service.IssueService;
import com.issuetracker.mapper.IssueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final IssueMapper issueMapper;

    @Override
    public IssueResponseDto createIssue(IssueRequestDto request, String email) {

        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        User assignedUser = userRepository.findById(request.getAssignedToUserId())
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));

        Issue issue = issueMapper.mapToEntity(request, creator, assignedUser);

        return issueMapper.mapToResponse(issueRepository.save(issue));
    }

    @Override
    public List<IssueResponseDto> getAllIssues() {
        return issueRepository.findAll().stream()
                .map(issueMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public IssueResponseDto getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        return issueMapper.mapToResponse(issue);
    }

    @Override
    public List<IssueResponseDto> getIssuesAssignedToUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return issueRepository.findByAssignedToUser(user).stream()
                .map(issueMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public IssueResponseDto updateIssue(Long id, IssueRequestDto request) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        issueMapper.updateIssueFromRequest(request, issue);

        if (request.getAssignedToUserId() != null) {
            User assignedUser = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            issue.setAssignedToUser(assignedUser);
        }

        return issueMapper.mapToResponse(issueRepository.save(issue));
    }

    @Override
    public long getTotalIssueCount() {
        return issueRepository.count();
    }

    @Override
    public long getInProgressIssueCount() {
        return issueRepository.countByStatus(com.issuetracker.enums.Status.IN_PROGRESS);
    }

    @Override
    public void deleteIssue(Long id) {
        issueRepository.deleteById(id);
    }

    @Override
    public com.issuetracker.dto.DashboardStatsDto getStats() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String currentEmail = auth.getName();
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);

        List<Issue> allIssues = issueRepository.findAll();
        java.time.LocalDateTime overdueLimit = java.time.LocalDateTime.now().minusDays(7);

        java.util.Map<String, Long> typeDist = allIssues.stream()
                .collect(Collectors.groupingBy(i -> i.getIssueType() != null ? i.getIssueType().name() : "UNKNOWN",
                        Collectors.counting()));

        java.util.Map<String, Long> statusDist = allIssues.stream()
                .collect(Collectors.groupingBy(i -> i.getStatus() != null ? i.getStatus().name() : "UNKNOWN",
                        Collectors.counting()));

        java.util.Map<String, Long> priorityDist = allIssues.stream()
                .collect(Collectors.groupingBy(i -> i.getPriority() != null ? i.getPriority().name() : "UNKNOWN",
                        Collectors.counting()));

        com.issuetracker.dto.MyAssignedStatsDto myStats = com.issuetracker.dto.MyAssignedStatsDto.builder().build();
        if (currentUser != null) {
            myStats.setTotalAssigned(issueRepository.findByAssignedToUser(currentUser).size());
            myStats.setOpenCount(issueRepository
                    .findByAssignedToUserAndStatus(currentUser, com.issuetracker.enums.Status.OPEN).size());
            myStats.setInProgressCount(issueRepository
                    .findByAssignedToUserAndStatus(currentUser, com.issuetracker.enums.Status.IN_PROGRESS).size());
            myStats.setOverdueCount(issueRepository.findOverdueIssues(overdueLimit).stream()
                    .filter(i -> i.getAssignedToUser() != null
                            && i.getAssignedToUser().getId().equals(currentUser.getId()))
                    .count());
        }

        List<com.issuetracker.dto.ActivityDto> recentActivity = allIssues.stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .limit(5)
                .map(i -> com.issuetracker.dto.ActivityDto.builder()
                        .issueId(i.getId())
                        .action("Updated State") // Simulating activity for now
                        .time(i.getUpdatedAt())
                        .icon("alert-circle")
                        .build())
                .collect(Collectors.toList());

        List<com.issuetracker.dto.IssueResponseDto> recentIssues = issueRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(issueMapper::mapToResponse)
                .collect(Collectors.toList());

        return com.issuetracker.dto.DashboardStatsDto.builder()
                .totalIssues(allIssues.size())
                .openIssues(issueRepository.countByStatus(com.issuetracker.enums.Status.OPEN))
                .inProgressIssues(issueRepository.countByStatus(com.issuetracker.enums.Status.IN_PROGRESS))
                .resolvedIssues(issueRepository.countByStatus(com.issuetracker.enums.Status.RESOLVED))
                .highPriorityIssues(issueRepository.countByPriority(com.issuetracker.enums.Priority.HIGH))
                .criticalIssues(issueRepository.countByPriority(com.issuetracker.enums.Priority.CRITICAL))
                .overdueIssues(issueRepository.findOverdueIssues(overdueLimit).size())
                .unassignedIssues(issueRepository.countByAssignedToUserIsNull())
                .typeDistribution(typeDist)
                .statusDistribution(statusDist)
                .priorityDistribution(priorityDist)
                .myAssignedIssues(myStats)
                .recentActivity(recentActivity)
                .recentlyCreatedIssues(recentIssues)
                .build();
    }

    @Override
    public List<com.issuetracker.dto.UserLeaderboardDto> getLeaderboard() {
        return issueRepository.getLeaderboard(org.springframework.data.domain.PageRequest.of(0, 3));
    }
}
