package com.clouddeploy.sites;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteRepository extends JpaRepository<Site, String> {
    List<Site> findByOwnerIdAndDeletedAtIsNullOrderByCreatedAtDesc(String ownerId);
    Optional<Site> findByIdAndDeletedAtIsNull(String id);
    Optional<Site> findByIdAndOwnerIdAndDeletedAtIsNull(String id, String ownerId);
    Optional<Site> findBySlugAndDeletedAtIsNull(String slug);
    long countByOwnerIdAndDeletedAtIsNull(String ownerId);
    long countByDeletedAtIsNull();
}
