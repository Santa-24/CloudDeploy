package com.clouddeploy.deployments;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RollbackRequestDto {
    @NotBlank(message = "Target deployment ID is required")
    private String targetDeploymentId;
}
