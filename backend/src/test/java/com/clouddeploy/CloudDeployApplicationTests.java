package com.clouddeploy;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("local")
class CloudDeployApplicationTests {

    @Test
    void contextLoads() {
        // Ensures the entire Spring Boot application context, Flyway migration,
        // and security filter chain initialize without bean or configuration errors.
    }
}
