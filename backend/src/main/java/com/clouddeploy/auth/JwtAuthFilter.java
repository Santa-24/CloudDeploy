package com.clouddeploy.auth;

import com.clouddeploy.config.StorageProperties;
import com.clouddeploy.users.AccountStatus;
import com.clouddeploy.users.PlanTier;
import com.clouddeploy.users.User;
import com.clouddeploy.users.UserRepository;
import com.clouddeploy.users.UserRole;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final UserRepository userRepository;
    private final StorageProperties storageProperties;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            try {
                processAuthentication(token);
            } catch (Exception e) {
                log.warn("Authentication failed for token: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private void processAuthentication(String token) {
        // Support for local development / testing tokens and simulated Cognito JWTs
        String email = "architect@clouddeploy.internal";

        if (token.startsWith("jwt-")) {
            email = token.substring(4);
        } else if (token.contains("@")) {
            email = token;
        }

        email = email.trim().toLowerCase();

        // Retrieve or auto-provision local user in development/test
        Optional<User> existing = userRepository.findByEmail(email);
        final String userEmail = email;
        User user = existing.orElseGet(() -> {
            boolean isAdmin = userEmail.contains("admin");
            User newUser = User.builder()
                    .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                    .cognitoSub("cognito-sub-" + UUID.randomUUID())
                    .email(userEmail)
                    .role(isAdmin ? UserRole.ADMIN : UserRole.USER)
                    .accountStatus(AccountStatus.ACTIVE)
                    .planTier(isAdmin ? PlanTier.TEAM : PlanTier.FREE)
                    .storageQuotaBytes(isAdmin ? PlanTier.TEAM.getStorageQuotaBytes() : PlanTier.FREE.getStorageQuotaBytes())
                    .maxSites(isAdmin ? PlanTier.TEAM.getMaxSites() : PlanTier.FREE.getMaxSites())
                    .build();
            return userRepository.save(newUser);
        });

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user, null, Collections.singletonList(authority)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
