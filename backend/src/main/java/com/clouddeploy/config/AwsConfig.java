package com.clouddeploy.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudfront.CloudFrontClient;
import software.amazon.awssdk.services.cloudwatch.CloudWatchClient;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.sns.SnsClient;

@Configuration
public class AwsConfig {

    private static final Logger log = LoggerFactory.getLogger(AwsConfig.class);

    @Value("${aws.region:ap-south-1}")
    private String awsRegion;

    @Value("${aws.access-key-id:}")
    private String awsAccessKeyId;

    @Value("${aws.secret-access-key:}")
    private String awsSecretAccessKey;

    @Value("${app.storage-mode:local}")
    private String storageMode;

    private Region getRegion() {
        return Region.of(awsRegion);
    }

    private AwsCredentialsProvider getCredentialsProvider() {
        if (awsAccessKeyId != null && !awsAccessKeyId.isBlank()
                && awsSecretAccessKey != null && !awsSecretAccessKey.isBlank()) {
            return StaticCredentialsProvider.create(AwsBasicCredentials.create(awsAccessKeyId.trim(), awsSecretAccessKey.trim()));
        }
        try {
            // In EC2 production or when AWS CLI is logged in, DefaultCredentialsProvider automatically checks
            // Environment Variables -> System Properties -> Web Identity Token -> ECS Container Credentials -> EC2 Instance Profile (IAM Role)
            DefaultCredentialsProvider provider = DefaultCredentialsProvider.create();
            provider.resolveCredentials(); // Probe availability
            return provider;
        } catch (Exception e) {
            log.info("Active AWS credentials not detected on host. Initializing graceful test double credentials for local profile.");
            return AnonymousCredentialsProvider.create();
        }
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(getRegion())
                .credentialsProvider(getCredentialsProvider())
                .build();
    }

    @Bean
    public CloudFrontClient cloudFrontClient() {
        return CloudFrontClient.builder()
                .region(Region.AWS_GLOBAL)
                .credentialsProvider(getCredentialsProvider())
                .build();
    }

    @Bean
    public CognitoIdentityProviderClient cognitoClient() {
        return CognitoIdentityProviderClient.builder()
                .region(getRegion())
                .credentialsProvider(getCredentialsProvider())
                .build();
    }

    @Bean
    public SecretsManagerClient secretsManagerClient() {
        return SecretsManagerClient.builder()
                .region(getRegion())
                .credentialsProvider(getCredentialsProvider())
                .build();
    }

    @Bean
    public CloudWatchClient cloudWatchClient() {
        return CloudWatchClient.builder()
                .region(getRegion())
                .credentialsProvider(getCredentialsProvider())
                .build();
    }

    @Bean
    public SnsClient snsClient() {
        return SnsClient.builder()
                .region(getRegion())
                .credentialsProvider(getCredentialsProvider())
                .build();
    }
}
