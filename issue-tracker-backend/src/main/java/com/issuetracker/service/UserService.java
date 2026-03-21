package com.issuetracker.service;

import com.issuetracker.dto.UserResponse;
import com.issuetracker.entity.User;

public interface UserService {
    UserResponse getCurrentUserProfile(String email);
    User findByEmail(String email);
    java.util.List<UserResponse> getAllUsers();
}
