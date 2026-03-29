package com.issuetracker.repo;

import com.issuetracker.entity.Issue;
import com.issuetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByAssignedToUser(User user);

    List<Issue> findByCreatedByUser(User user);

    long countByStatus(com.issuetracker.enums.Status status);

    long countByAssignedToUserIsNull();

    long countByPriority(com.issuetracker.enums.Priority priority);

    List<Issue> findTop5ByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("SELECT i FROM Issue i WHERE i.status != com.issuetracker.enums.Status.RESOLVED "
            +
            "AND i.status != com.issuetracker.enums.Status.CLOSED " +
            "AND i.updatedAt < :overdueLimit")
    List<Issue> findOverdueIssues(
            @org.springframework.web.bind.annotation.PathVariable("overdueLimit") java.time.LocalDateTime overdueLimit);

    List<Issue> findByAssignedToUserAndStatus(User user, com.issuetracker.enums.Status status);

    @org.springframework.data.jpa.repository.Query("SELECT new com.issuetracker.dto.UserLeaderboardDto(u.id, u.name, u.email, COUNT(i)) "
            +
            "FROM Issue i JOIN i.assignedToUser u " +
            "WHERE i.status = com.issuetracker.enums.Status.RESOLVED " +
            "GROUP BY u.id, u.name, u.email " +
            "ORDER BY COUNT(i) DESC")
    java.util.List<com.issuetracker.dto.UserLeaderboardDto> getLeaderboard(
            org.springframework.data.domain.Pageable pageable);
}
