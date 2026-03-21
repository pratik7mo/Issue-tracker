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
        List<Issue> allIssues = issueRepository.findAll();
        
        java.util.Map<String, Long> typeDist = allIssues.stream()
            .collect(Collectors.groupingBy(i -> i.getIssueType() != null ? i.getIssueType().name() : "UNKNOWN", Collectors.counting()));
            
        java.util.Map<String, Long> statusDist = allIssues.stream()
            .collect(Collectors.groupingBy(i -> i.getStatus() != null ? i.getStatus().name() : "UNKNOWN", Collectors.counting()));

        return com.issuetracker.dto.DashboardStatsDto.builder()
                .totalIssues(issueRepository.count())
                .inProgressIssues(issueRepository.countByStatus(com.issuetracker.enums.Status.IN_PROGRESS))
                .resolvedIssues(issueRepository.countByStatus(com.issuetracker.enums.Status.RESOLVED))
                .highPriorityIssues(issueRepository.countByPriority(com.issuetracker.enums.Priority.HIGH) + 
                                   issueRepository.countByPriority(com.issuetracker.enums.Priority.CRITICAL))
                .typeDistribution(typeDist)
                .statusDistribution(statusDist)
                .build();
    }

    @Override
    public List<com.issuetracker.dto.UserLeaderboardDto> getLeaderboard() {
        return issueRepository.getLeaderboard(org.springframework.data.domain.PageRequest.of(0, 3));
    }
}
