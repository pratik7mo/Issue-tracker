package com.issuetracker.service;

import com.issuetracker.dto.UserResponse;
import com.issuetracker.entity.User;
import java.util.Optional;

public interface UserService {
    UserResponse getCurrentUserProfile(String email);

    User findByEmail(String email);

    java.util.List<UserResponse> getAllUsers();

    UserResponse updateUser(Long id, com.issuetracker.dto.UserUpdateRequest request);

    void deleteUser(Long id);

    void createPasswordResetTokenForUser(User user, String token);

    String validatePasswordResetToken(String token);

    void changeUserPassword(User user, String newPassword);

    Optional<com.issuetracker.entity.PasswordResetToken> findResetToken(String token);
}
