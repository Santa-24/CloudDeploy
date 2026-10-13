package com.clouddeploy.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    void testRegisterUser() {
        AuthDtos.RegisterRequest request = new AuthDtos.RegisterRequest("newuser@clouddeploy.test", "Pass1234!", "USER");
        AuthDtos.AuthResponse response = authService.register(request);
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("newuser@clouddeploy.test", response.getUser().getEmail());
    }
}
