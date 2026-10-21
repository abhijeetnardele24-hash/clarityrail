import * as fs from "node:fs";
import * as path from "node:path";

export function runSecurityScan() {
  console.log("=== Running ClarityRail Security & Claims Integrity Scan ===");

  const forbiddenPatterns: { name: string; pattern: RegExp }[] = [
    { name: "Private Key", pattern: /-----BEGIN\s+(?:RSA|EC|OPENSSH|PGP)\s+PRIVATE\s+KEY-----/i },
    { name: "GitHub Personal Token", pattern: /\bgh[pousr]_[A-Za-z0-9_]{36,255}\b/ },
    { name: "AWS Secret Access Key", pattern: /(?:aws_secret_access_key|aws_access_key_id)\s*[:=]\s*["']?[A-Za-z0-9/+=]{20,40}["']?/i },
    { name: "OpenAI Secret Key", pattern: /\bsk-[A-Za-z0-9]{32,}\b/ },
  ];

  const forbiddenOverclaims: { name: string; pattern: RegExp }[] = [
    { name: "Unqualified 'WCAG compliant'", pattern: /\bWCAG\s+compliant\b/i },
    { name: "Unproven medical claim 'treats ADHD'", pattern: /\b(?:treats|cures|diagnoses)\s+ADHD\b/i },
    { name: "Unproven clinical claim 'clinically proven'", pattern: /\bclinically\s+proven\b/i },
    { name: "False PII claim 'zero PII'", pattern: /\bzero\s+PII\b/i },
    { name: "False neural claim 'AI-powered compiler'", pattern: /\bAI-powered\s+(?:compiler|rule\s+engine)\b/i },
  ];

  const violations: string[] = [];

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === "dist" ||
          entry.name === "coverage" ||
          entry.name === "test-results"
        ) {
          continue;
        }
        scanDir(fullPath);
      } else if (entry.isFile()) {
        if (
          entry.name.endsWith(".ts") ||
          entry.name.endsWith(".tsx") ||
          entry.name.endsWith(".md") ||
          entry.name.endsWith(".json")
        ) {
          // Skip scanning this script itself for the forbidden regex definitions
          if (entry.name === "security-scan.ts") continue;

          const content = fs.readFileSync(fullPath, "utf-8");

          // Check secret keys
          for (const item of forbiddenPatterns) {
            if (item.pattern.test(content)) {
              violations.push(`[CRITICAL SECRET] ${item.name} pattern detected in: ${fullPath}`);
            }
          }

          // Check documentation and code for forbidden overclaims
          for (const claim of forbiddenOverclaims) {
            if (claim.pattern.test(content)) {
              violations.push(`[TRUTHFULNESS VIOLATION] ${claim.name} detected in: ${fullPath}`);
            }
          }
        }
      }
    }
  }

  scanDir(process.cwd());

  if (violations.length > 0) {
    console.error(`FAILED: ${violations.length} security or claim violations found:`);
    for (const v of violations) {
      console.error(` - ${v}`);
    }
    process.exit(1);
  } else {
    console.log("✓ Security Scan PASSED: Zero private keys, zero leaked tokens, zero forbidden overclaims found.");
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("security-scan.ts")) {
  runSecurityScan();
}
