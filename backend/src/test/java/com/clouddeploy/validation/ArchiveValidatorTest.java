package com.clouddeploy.validation;

import com.clouddeploy.common.exceptions.ArchiveValidationException;
import com.clouddeploy.config.StorageProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class ArchiveValidatorTest {

    private ArchiveValidator validator;
    private StorageProperties properties;

    @BeforeEach
    void setUp() {
        properties = new StorageProperties();
        properties.setMaxFilesPerDeployment(100);
        properties.setMaxExtractedBytes(10485760L); // 10 MB
        validator = new ArchiveValidator(properties);
    }

    @Test
    void testValidZipArchive_Success(@TempDir Path tempDest) throws IOException {
        byte[] zipBytes = createZip(
                new String[]{"index.html", "styles/app.css", "js/bundle.js"},
                new String[]{"<html><body><h1>Atelier</h1></body></html>", "body { color: #1D1C19; }", "console.log('live');"}
        );

        ValidationResult result = validator.validateAndExtract(new ByteArrayInputStream(zipBytes), tempDest);

        assertTrue(result.isValid());
        assertEquals(3, result.getFileCount());
        assertTrue(Files.exists(tempDest.resolve("index.html")));
        assertTrue(Files.exists(tempDest.resolve("styles/app.css")));
    }

    @Test
    void testZipSlipAttack_Rejected(@TempDir Path tempDest) throws IOException {
        byte[] maliciousZip = createZip(
                new String[]{"index.html", "../../outside.txt"},
                new String[]{"<html></html>", "malicious payload"}
        );

        ArchiveValidationException ex = assertThrows(ArchiveValidationException.class, () ->
                validator.validateAndExtract(new ByteArrayInputStream(maliciousZip), tempDest)
        );

        assertTrue(ex.getErrorCode().contains("ZIP_SLIP") || ex.getErrorCode().contains("ZIP_PATH_TRAVERSAL"));
    }

    @Test
    void testMissingRootIndexHtml_Rejected(@TempDir Path tempDest) throws IOException {
        byte[] zipWithoutIndex = createZip(
                new String[]{"about.html", "styles.css"},
                new String[]{"<h1>About</h1>", "h1 { color: red; }"}
        );

        ArchiveValidationException ex = assertThrows(ArchiveValidationException.class, () ->
                validator.validateAndExtract(new ByteArrayInputStream(zipWithoutIndex), tempDest)
        );

        assertEquals("ZIP_MISSING_INDEX_HTML", ex.getErrorCode());
    }

    @Test
    void testForbiddenExecutableExtension_Rejected(@TempDir Path tempDest) throws IOException {
        byte[] zipWithExe = createZip(
                new String[]{"index.html", "scripts/exploit.php"},
                new String[]{"<html></html>", "<?php echo 'forbidden'; ?>"}
        );

        ArchiveValidationException ex = assertThrows(ArchiveValidationException.class, () ->
                validator.validateAndExtract(new ByteArrayInputStream(zipWithExe), tempDest)
        );

        assertEquals("FORBIDDEN_FILE_TYPE", ex.getErrorCode());
    }

    @Test
    void testNestedFolderZip_NormalizedToRoot(@TempDir Path tempDest) throws IOException {
        byte[] nestedZip = createZip(
                new String[]{"my-website/index.html", "my-website/style.css", "my-website/js/app.js"},
                new String[]{"<h1>Hello</h1>", "body { margin: 0; }", "console.log('nested');"}
        );

        ValidationResult result = validator.validateAndExtract(new ByteArrayInputStream(nestedZip), tempDest);

        assertTrue(result.isValid());
        assertTrue(Files.exists(tempDest.resolve("index.html")));
        assertTrue(Files.exists(tempDest.resolve("style.css")));
        assertTrue(Files.exists(tempDest.resolve("js/app.js")));
    }

    private byte[] createZip(String[] names, String[] contents) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (int i = 0; i < names.length; i++) {
                ZipEntry entry = new ZipEntry(names[i]);
                zos.putNextEntry(entry);
                zos.write(contents[i].getBytes());
                zos.closeEntry();
            }
        }
        return baos.toByteArray();
    }
}
