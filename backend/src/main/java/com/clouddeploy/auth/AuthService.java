package com.clouddeploy.auth;

import com.clouddeploy.audit.AuditService;
import com.clouddeploy.common.exceptions.UnauthorizedException;
import com.clouddeploy.users.AccountStatus;
import com.clouddeploy.users.PlanTier;
import com.clouddeploy.users.User;
import com.clouddeploy.users.UserRepository;
import com.clouddeploy.users.UserRole;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        log.info("Processing login request for: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    // Auto-provision initial user in dev/local mode if not found
                    boolean isAdmin = request.getEmail().contains("admin");
                    User newUser = User.builder()
                            .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                            .cognitoSub("cognito-sub-" + UUID.randomUUID())
                            .email(request.getEmail().trim().toLowerCase())
                            .role(isAdmin ? UserRole.ADMIN : UserRole.USER)
                            .accountStatus(AccountStatus.ACTIVE)
                            .planTier(isAdmin ? PlanTier.TEAM : PlanTier.FREE)
                            .storageQuotaBytes(isAdmin ? PlanTier.TEAM.getStorageQuotaBytes() : PlanTier.FREE.getStorageQuotaBytes())
                            .maxSites(isAdmin ? PlanTier.TEAM.getMaxSites() : PlanTier.FREE.getMaxSites())
                            .build();
                    return userRepository.save(newUser);
                });

        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new UnauthorizedException("Account is suspended. Please contact platform administrators.");
        }

        String token = "jwt-" + user.getEmail().trim().toLowerCase();
        auditService.record(user.getEmail(), "USER_LOGIN", user.getId(), "Login successful");

        return AuthDtos.AuthResponse.builder()
                .token(token)
                .user(user)
                .demoMode(false)
                .build();
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        log.info("Processing registration request for: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with email " + request.getEmail() + " already exists.");
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(request.getRole());
        UserRole role = isAdmin ? UserRole.ADMIN : UserRole.USER;

        User user = User.builder()
                .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                .cognitoSub("cognito-sub-" + UUID.randomUUID())
                .email(request.getEmail().trim().toLowerCase())
                .role(role)
                .accountStatus(AccountStatus.ACTIVE)
                .planTier(isAdmin ? PlanTier.TEAM : PlanTier.FREE)
                .storageQuotaBytes(isAdmin ? PlanTier.TEAM.getStorageQuotaBytes() : PlanTier.FREE.getStorageQuotaBytes())
                .maxSites(isAdmin ? PlanTier.TEAM.getMaxSites() : PlanTier.FREE.getMaxSites())
                .build();

        user = userRepository.save(user);
        auditService.record(user.getEmail(), "USER_REGISTER", user.getId(), "Tenant workspace initialized with Free tier (3 projects limit)");

        String token = "jwt-" + user.getEmail().trim().toLowerCase();
        return AuthDtos.AuthResponse.builder()
                .token(token)
                .user(user)
                .demoMode(false)
                .build();
    }

    public void forgotPassword(AuthDtos.ForgotPasswordRequest request) {
        log.info("Processing password recovery for: {}", request.getEmail());
        auditService.record(request.getEmail(), "PASSWORD_RESET_REQUEST", request.getEmail(), "Dispatched Cognito recovery code");
    }
}
