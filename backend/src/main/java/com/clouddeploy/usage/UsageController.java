package com.clouddeploy.usage;

import com.clouddeploy.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageController {

    private final UsageService usageService;

    @GetMapping
    public ResponseEntity<UsageDtos.UsageQuotaResponse> getUsage(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(usageService.getUsageForUser(user));
    }
}
