package com.issuetracker.mapper;

import com.issuetracker.dto.UserResponse;
import com.issuetracker.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null)
            return null;
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public void updateFromDto(com.issuetracker.dto.UserUpdateRequest request, User user) {
        if (request == null || user == null)
            return;
        if (request.getName() != null)
            user.setName(request.getName());
        if (request.getRole() != null)
            user.setRole(request.getRole());
    }
}
