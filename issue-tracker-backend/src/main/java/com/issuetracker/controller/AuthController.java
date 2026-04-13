package com.issuetracker.controller;

import com.issuetracker.dto.AuthRequest;
import com.issuetracker.dto.AuthResponse;
import com.issuetracker.dto.ForgotPasswordRequest;
import com.issuetracker.dto.RegisterRequestDto;
import com.issuetracker.dto.RegisterResponseDto;
import com.issuetracker.dto.ResetPasswordRequest;
import com.issuetracker.dto.ApiResponse;
import com.issuetracker.entity.User;
import com.issuetracker.repo.jpa.UserRepository;
import com.issuetracker.security.CustomUserDetailsService;
import com.issuetracker.security.JwtUtil;
import com.issuetracker.service.EmailService;
import com.issuetracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final UserService userService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@RequestBody RegisterRequestDto request) {
        log.info("Register request received for email: {}", request.getEmail());
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(
                    RegisterResponseDto.builder()
                            .message("Email already exists")
                            .build());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : com.issuetracker.enums.Role.DEVELOPER)
                .build();

        userRepository.save(user);

        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(
                RegisterResponseDto.builder()
                        .message("User registered successfully")
                        .token(jwt)
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole().name())
                        .build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Account not registered with this ID",
                    org.springframework.http.HttpStatus.BAD_REQUEST));
        }

        String token = UUID.randomUUID().toString();
        userService.createPasswordResetTokenForUser(user, token);
        String resetUrl = "http://localhost:8085/reset-password?token=" + token;
        emailService.sendEmail(user.getEmail(), "Password Reset Request",
                "To reset your password, click the link below:\n" + resetUrl);

        return ResponseEntity.ok("If an account with that email exists, we have sent a reset link.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        String result = userService.validatePasswordResetToken(request.getToken());
        if (result != null) {
            return ResponseEntity.badRequest().body(result);
        }

        com.issuetracker.entity.PasswordResetToken token = userService.findResetToken(request.getToken()).orElseThrow();

        userService.changeUserPassword(token.getUser(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successfully.");
    }
}
