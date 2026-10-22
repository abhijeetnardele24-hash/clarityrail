import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

const secretPatterns = [
  { name: "Private Key", pattern: /-----BEGIN\s+(?:RSA|EC|OPENSSH|PGP)\s+PRIVATE\s+KEY-----/i },
  { name: "GitHub Personal Token", pattern: /\bgh[pousr]_[A-Za-z0-9_]{36,255}\b/ },
  { name: "AWS Credential", pattern: /(?:aws_secret_access_key|aws_access_key_id)\s*[:=]\s*["']?[A-Za-z0-9/+=]{20,40}["']?/i },
  { name: "OpenAI Secret Key", pattern: /\bsk-[A-Za-z0-9]{32,}\b/ },
];

const claimPatterns = [
  { name: "Unqualified WCAG compliance", pattern: /\bWCAG(?:\s+2\.[012])?(?:\s+Level)?\s+AA\s+(?:compliant|certified)\b/i },
  { name: "Absolute hallucination guarantee", pattern: /\bzero\s+hallucination(?:s|\s+guarantee)?\b/i },
  { name: "Absolute auditability", pattern: /\b100%\s+auditability\b/i },
  { name: "Immutable local persistence", pattern: /\b(?:persist(?:ed)?|stored)\s+immutably\b/i },
  { name: "Unproven clinical claim", pattern: /\b(?:treats|cures|diagnoses)\s+ADHD|\bclinically\s+proven\b/i },
  { name: "False PII claim", pattern: /\bzero[- ]PII\b/i },
  { name: "False neural claim", pattern: /\bAI-powered\s+(?:compiler|rule\s+engine)\b/i },
];

const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".json", ".yml", ".yaml", ".css", ".html"]);
const ignoredDirectories = new Set(["node_modules", ".git", "dist", "coverage", "test-results", "playwright-report", "reports"]);

function git(args: string[], cwd: string): string {
  return execFileSync("git", args, { cwd, encoding: "utf-8", maxBuffer: 32 * 1024 * 1024 }).trim();
}

function scanContent(content: string, label: string, includeClaims: boolean, violations: string[]): void {
  for (const item of secretPatterns) {
    if (item.pattern.test(content)) violations.push(`[CRITICAL SECRET] ${item.name}: ${label}`);
  }
  if (includeClaims) {
    for (const item of claimPatterns) {
      if (item.pattern.test(content)) violations.push(`[TRUTHFULNESS] ${item.name}: ${label}`);
    }
  }
}

function worktreeFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(absolute);
    }
  };
  walk(root);
  return files;
}

export function runSecurityScan(root = process.cwd()): void {
  console.log("=== Running Full-History Security & Claims Integrity Scan ===");
  const shallow = git(["rev-parse", "--is-shallow-repository"], root);
  if (shallow !== "false") throw new Error("Full-history security scan requires a non-shallow Git checkout");

  const violations: string[] = [];
  const currentFiles = worktreeFiles(root);
  for (const absolute of currentFiles) {
    const relative = path.relative(root, absolute).replace(/\\/g, "/");
    if (relative === "scripts/security-scan.ts") continue;
    scanContent(fs.readFileSync(absolute, "utf-8"), `working tree:${relative}`, true, violations);
  }

  const commits = git(["rev-list", "--all"], root).split(/\r?\n/).filter(Boolean);
  const historicalPaths = new Set<string>();
  for (const commit of commits) {
    const files = git(["ls-tree", "-r", "--name-only", commit], root).split(/\r?\n/).filter(Boolean);
    for (const file of files) {
      if (!textExtensions.has(path.extname(file).toLowerCase()) || file === "scripts/security-scan.ts") continue;
      historicalPaths.add(file);
      try {
        scanContent(git(["show", `${commit}:${file}`], root), `${commit.slice(0, 8)}:${file}`, false, violations);
      } catch {
        // Binary/unreadable blobs are outside the text scanner's scope.
      }
    }
  }

  if (violations.length > 0) {
    console.error(`FAILED: ${violations.length} security or truthfulness violation(s):`);
    for (const violation of violations) console.error(` - ${violation}`);
    process.exitCode = 1;
    return;
  }
  console.log(`✓ Scanned ${commits.length} full-history commit(s), ${historicalPaths.size} historical path(s), and ${currentFiles.length} working-tree text file(s).`);
  console.log("✓ No configured secret signatures or current-worktree overclaim patterns detected.");
}

if (process.argv[1]?.endsWith("security-scan.ts")) runSecurityScan();
