package com.issuetracker.repo;

import com.issuetracker.entity.Issue;
import com.issuetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByAssignedToUser(User user);

    List<Issue> findByCreatedByUser(User user);

    long countByStatus(com.issuetracker.enums.Status status);

    long countByPriority(com.issuetracker.enums.Priority priority);

    @org.springframework.data.jpa.repository.Query("SELECT new com.issuetracker.dto.UserLeaderboardDto(u.id, u.name, u.email, COUNT(i)) " +
           "FROM Issue i JOIN i.assignedToUser u " +
           "WHERE i.status = com.issuetracker.enums.Status.RESOLVED " +
           "GROUP BY u.id, u.name, u.email " +
           "ORDER BY COUNT(i) DESC")
    java.util.List<com.issuetracker.dto.UserLeaderboardDto> getLeaderboard(org.springframework.data.domain.Pageable pageable);
}
