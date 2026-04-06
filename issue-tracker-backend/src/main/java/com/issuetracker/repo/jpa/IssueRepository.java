package com.issuetracker.repo.jpa;

import com.issuetracker.entity.Issue;
import com.issuetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import com.issuetracker.dto.UserLeaderboardDto;
import com.issuetracker.enums.Status;
import com.issuetracker.enums.Priority;

import java.util.List;
import java.time.LocalDateTime;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByAssignedToUser(User user);

    List<Issue> findByCreatedByUser(User user);

    long countByStatus(Status status);

    long countByAssignedToUserIsNull();

    long countByPriority(Priority priority);

    List<Issue> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT i FROM Issue i WHERE i.status != com.issuetracker.enums.Status.RESOLVED "
            + "AND i.status != com.issuetracker.enums.Status.CLOSED "
            + "AND i.updatedAt < :overdueLimit")
    List<Issue> findOverdueIssues(
            @org.springframework.data.repository.query.Param("overdueLimit") LocalDateTime overdueLimit);

    List<Issue> findByAssignedToUserAndStatus(User user, Status status);

    @Query("SELECT new com.issuetracker.dto.UserLeaderboardDto(u.id, u.name, u.email, COUNT(i)) "
            + "FROM Issue i JOIN i.assignedToUser u " 
            + "WHERE i.status = com.issuetracker.enums.Status.RESOLVED " 
            + "GROUP BY u.id, u.name, u.email " 
            + "ORDER BY COUNT(i) DESC")
    List<UserLeaderboardDto> getLeaderboard(Pageable pageable);
}
