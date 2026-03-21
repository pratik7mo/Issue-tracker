package com.issuetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserLeaderboardDto {
    private Long id;
    private String name;
    private String email;
    private Long resolvedCount;
}
