package com.clouddeploy.usage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsageRepository extends JpaRepository<UsageRecord, String> {
    Optional<UsageRecord> findTopByOwnerIdOrderByMeasuredAtDesc(String ownerId);
}
