package com.clouddeploy.validation;

import com.clouddeploy.common.exceptions.ArchiveValidationException;
import com.clouddeploy.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveInputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
public class ArchiveValidator {

    private static final Logger log = LoggerFactory.getLogger(ArchiveValidator.class);
    private final StorageProperties storageProperties;

    private static final Set<String> FORBIDDEN_EXTENSIONS = Set.of(
            ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs",
            ".php", ".py", ".rb", ".pl", ".cgi",
            ".jar", ".war", ".class",
            ".env", ".htaccess", ".htpasswd",
            ".jsp", ".asp", ".aspx"
    );

    public ValidationResult validateAndExtract(InputStream inputStream, Path destinationDir) {
        log.info("Starting archive validation and sandboxed extraction to: {}", destinationDir);

        int fileCount = 0;
        long totalBytes = 0;
        boolean hasRootIndexHtml = false;
        List<String> extractedRelativePaths = new ArrayList<>();

        Path normalizedDest = destinationDir.normalize();

        try (ZipArchiveInputStream zis = new ZipArchiveInputStream(inputStream)) {
            ZipArchiveEntry entry;
            byte[] buffer = new byte[8192];

            while ((entry = zis.getNextEntry()) != null) {
                String entryName = entry.getName();

                // Skip system and hidden metadata files (macOS __MACOSX, Windows Thumbs.db, .DS_Store)
                if (entryName.startsWith("__MACOSX") || entryName.contains("/__MACOSX") ||
                        entryName.endsWith(".DS_Store") || entryName.endsWith("Thumbs.db")) {
                    continue;
                }

                // 1. Path Traversal & Absolute Path checks (ZIP Slip protection)
                if (entryName.startsWith("/") || entryName.startsWith("\\") || (entryName.length() > 1 && entryName.charAt(1) == ':')) {
                    throw new ArchiveValidationException("ZIP_PATH_TRAVERSAL", "Archive contains disallowed absolute path: " + entryName);
                }

                Path resolvedPath = destinationDir.resolve(entryName).normalize();
                if (!resolvedPath.startsWith(normalizedDest)) {
                    throw new ArchiveValidationException("ZIP_SLIP_ATTEMPT", "Zip slip directory traversal detected for path: " + entryName);
                }

                // If entry is directory, create and continue
                if (entry.isDirectory()) {
                    Files.createDirectories(resolvedPath);
                    continue;
                }

                // 2. Max File Count Check (Decompression bomb mitigation)
                fileCount++;
                if (fileCount > storageProperties.getMaxFilesPerDeployment()) {
                    throw new ArchiveValidationException("ZIP_EXCESSIVE_FILES",
                            "Archive exceeds maximum permitted file limit of " + storageProperties.getMaxFilesPerDeployment() + " files.");
                }

                // 3. Forbidden File Extensions check
                String lowerName = entryName.toLowerCase();
                for (String forbiddenExt : FORBIDDEN_EXTENSIONS) {
                    if (lowerName.endsWith(forbiddenExt) || lowerName.contains(forbiddenExt + ".")) {
                        throw new ArchiveValidationException("FORBIDDEN_FILE_TYPE",
                                "Archive contains disallowed executable or server-side asset: " + entryName);
                    }
                }

                // 4. Root index.html check
                if (entryName.equalsIgnoreCase("index.html") || entryName.equalsIgnoreCase("index.htm")) {
                    hasRootIndexHtml = true;
                }

                // Ensure parent directory exists
                Files.createDirectories(resolvedPath.getParent());

                // 5. Decompression Bomb Size Check while streaming
                try (OutputStream os = Files.newOutputStream(resolvedPath)) {
                    int read;
                    while ((read = zis.read(buffer)) != -1) {
                        totalBytes += read;
                        if (totalBytes > storageProperties.getMaxExtractedBytes()) {
                            throw new ArchiveValidationException("DECOMPRESSION_BOMB_LIMIT",
                                    "Archive exceeds maximum decompressed size quota of " +
                                            (storageProperties.getMaxExtractedBytes() / (1024 * 1024)) + " MB.");
                        }
                        os.write(buffer, 0, read);
                    }
                }

                extractedRelativePaths.add(entryName);
            }

            // 6. Automatic Root Normalization if index.html is nested under a common folder
            if (!hasRootIndexHtml) {
                Path nestedIndex = findNestedIndexHtml(destinationDir);
                if (nestedIndex != null) {
                    Path parentFolder = nestedIndex.getParent();
                    log.info("Detected nested index.html at {}. Normalizing archive structure to root.", nestedIndex);
                    promoteDirectoryContents(parentFolder, destinationDir);
                    hasRootIndexHtml = true;
                    extractedRelativePaths = collectRelativeFilePaths(destinationDir);
                    fileCount = extractedRelativePaths.size();
                } else {
                    throw new ArchiveValidationException("ZIP_MISSING_INDEX_HTML",
                            "Archive must contain an index.html entry point. If compressed in a subfolder, verify an index.html exists.");
                }
            }

            log.info("Archive successfully validated: {} files, {} uncompressed bytes.", fileCount, totalBytes);
            return ValidationResult.success(fileCount, totalBytes, extractedRelativePaths);

        } catch (ArchiveValidationException ave) {
            throw ave;
        } catch (IOException e) {
            log.error("Failed to parse archive stream", e);
            throw new ArchiveValidationException("MALFORMED_ARCHIVE", "ZIP archive stream is corrupted or cannot be unpacked.");
        }
    }

    private Path findNestedIndexHtml(Path dir) {
        try (Stream<Path> stream = Files.walk(dir, 4)) {
            return stream
                    .filter(Files::isRegularFile)
                    .filter(p -> {
                        String fn = p.getFileName().toString().toLowerCase();
                        return fn.equals("index.html") || fn.equals("index.htm");
                    })
                    .sorted(Comparator.comparingInt(Path::getNameCount))
                    .findFirst()
                    .orElse(null);
        } catch (IOException e) {
            log.warn("Error scanning for nested index.html", e);
            return null;
        }
    }

    private void promoteDirectoryContents(Path sourceDir, Path targetDir) throws IOException {
        if (sourceDir.equals(targetDir)) return;
        Path tempStaging = Files.createTempDirectory("promote-staging-");
        try {
            try (Stream<Path> stream = Files.list(sourceDir)) {
                for (Path item : stream.toList()) {
                    Files.move(item, tempStaging.resolve(item.getFileName()), StandardCopyOption.REPLACE_EXISTING);
                }
            }
            deleteRecursively(sourceDir);

            try (Stream<Path> stream = Files.list(tempStaging)) {
                for (Path item : stream.toList()) {
                    Files.move(item, targetDir.resolve(item.getFileName()), StandardCopyOption.REPLACE_EXISTING);
                }
            }
        } finally {
            deleteRecursively(tempStaging);
        }
    }

    private List<String> collectRelativeFilePaths(Path rootDir) {
        List<String> paths = new ArrayList<>();
        try (Stream<Path> stream = Files.walk(rootDir)) {
            stream.filter(Files::isRegularFile).forEach(p -> {
                String rel = rootDir.relativize(p).toString().replace('\\', '/');
                paths.add(rel);
            });
        } catch (IOException e) {
            log.warn("Error walking normalized files", e);
        }
        return paths;
    }

    private void deleteRecursively(Path path) {
        try {
            if (Files.exists(path)) {
                try (Stream<Path> stream = Files.walk(path)) {
                    stream.sorted(Comparator.reverseOrder())
                            .map(Path::toFile)
                            .forEach(File::delete);
                }
            }
        } catch (Exception ignored) {}
    }
}
