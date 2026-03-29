package com.issuetracker.service.impl;

import com.issuetracker.dto.UserResponse;
import com.issuetracker.entity.User;
import com.issuetracker.repo.UserRepository;
import com.issuetracker.repo.PasswordResetTokenRepository;
import com.issuetracker.entity.PasswordResetToken;
import com.issuetracker.mapper.UserMapper;
import com.issuetracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public UserResponse getCurrentUserProfile(String email) {
        User user = findByEmail(email);
        return userMapper.toResponse(user);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Override
    public java.util.List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void createPasswordResetTokenForUser(User user, String token) {
        PasswordResetToken myToken = tokenRepository.findByUser(user)
                .map(t -> {
                    t.setToken(token);
                    t.setExpiryDate(LocalDateTime.now().plusHours(24));
                    return t;
                })
                .orElseGet(() -> PasswordResetToken.builder()
                        .token(token)
                        .user(user)
                        .expiryDate(LocalDateTime.now().plusHours(24))
                        .build());
        tokenRepository.save(myToken);
    }

    @Override
    public String validatePasswordResetToken(String token) {
        Optional<PasswordResetToken> passToken = tokenRepository.findByToken(token);

        if (passToken.isEmpty()) {
            return "invalidToken";
        }
        if (passToken.get().isExpired()) {
            return "expired";
        }
        return null;
    }

    @Override
    @Transactional
    public void changeUserPassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.deleteByUser(user);
    }

    @Override
    public Optional<PasswordResetToken> findResetToken(String token) {
        return tokenRepository.findByToken(token);
    }
}
