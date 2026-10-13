package com.clouddeploy.users;

import com.clouddeploy.audit.AuditService;
import com.clouddeploy.common.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserRepository userRepository;
    private final AuditService auditService;

    @GetMapping("/plan")
    public ResponseEntity<UserPlanResponse> getCurrentPlan(@AuthenticationPrincipal User authUser) {
        User user = userRepository.findById(authUser.getId())
                .orElse(authUser);
        return ResponseEntity.ok(UserPlanResponse.from(user));
    }

    @PutMapping("/plan")
    public ResponseEntity<User> updatePlan(
            @AuthenticationPrincipal User authUser,
            @Valid @RequestBody UpdatePlanRequest request) {
        log.info("Updating subscription plan for user {} to {}", authUser.getEmail(), request.getPlanTier());

        User user = userRepository.findById(authUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authUser.getId()));

        PlanTier newTier = request.getPlanTier();
        user.setPlanTier(newTier);
        user.setMaxSites(newTier.getMaxSites());
        user.setStorageQuotaBytes(newTier.getStorageQuotaBytes());

        User updated = userRepository.save(user);
        auditService.record(user.getEmail(), "PLAN_UPGRADE", user.getId(),
                "Subscription plan changed to " + newTier.name() + " (maxSites=" + newTier.getMaxSites() + ")");

        return ResponseEntity.ok(updated);
    }
}
