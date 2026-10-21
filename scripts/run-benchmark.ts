import * as fs from "node:fs";
import * as path from "node:path";
import { compileBrief } from "../src/domain/compiler/compiler";
import { segmentSourceText } from "../src/domain/compiler/segmenter";
import { calculateRevisionImpact, applyRevisionStaleness } from "../src/domain/revision/impact";
import { findDependencySafeDetour } from "../src/domain/detour/selector";

export interface BenchmarkCase {
  id: string;
  category: "ASSIGNMENT" | "GROUP_HANDOFF" | "ADMINISTRATIVE" | "AMBIGUOUS" | "DEPENDENCY_CHAIN" | "MALFORMED";
  rawBrief: string;
  expectedMinActions: number;
  expectedMaxActions: number;
  expectedAmbiguities: number;
  hasSequentialDependency: boolean;
  revisionSnippet?: {
    revisedText: string;
    expectedStaleSteps: number;
  };
}

// 40 Labelled Synthetic Brief Cases
export const BENCHMARK_CORPUS: BenchmarkCase[] = [
  // 1-10: Academic Coursework Assignments
  {
    id: "assign_01",
    category: "ASSIGNMENT",
    rawBrief: "Download the assignment PDF. Review the lecture slides on sorting algorithms. Implement quicksort in Python. Submit your code before Friday at 5:00 PM EST.",
    expectedMinActions: 4,
    expectedMaxActions: 4,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "assign_02",
    category: "ASSIGNMENT",
    rawBrief: "Please read Chapter 4 of the textbook. Write a 2-page critical summary of the findings. Upload your summary to the portal.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 1, // Missing deliverable format on upload
    hasSequentialDependency: true,
  },
  {
    id: "assign_03",
    category: "ASSIGNMENT",
    rawBrief: "Download lab starter files. Configure your virtual environment. Run the automated test suite.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "assign_04",
    category: "ASSIGNMENT",
    rawBrief: "Review the research paper. Outline your methodology. Draft the literature review section. Submit by Sunday.",
    expectedMinActions: 4,
    expectedMaxActions: 4,
    expectedAmbiguities: 2, // Deadline without time zone, submit without format
    hasSequentialDependency: true,
  },
  {
    id: "assign_05",
    category: "ASSIGNMENT",
    rawBrief: "Collect 5 empirical dataset samples. Analyze the variance across categories. Format your results in an Excel spreadsheet.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "assign_06",
    category: "ASSIGNMENT",
    rawBrief: "Download the dataset. Calculate summary statistics. Clean missing values. Export the final CSV.",
    expectedMinActions: 4,
    expectedMaxActions: 4,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "assign_07",
    category: "ASSIGNMENT",
    rawBrief: "Read the case study on renewable energy. Prepare an executive summary. Submit before midnight.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 2, // No time zone, no format
    hasSequentialDependency: true,
  },
  {
    id: "assign_08",
    category: "ASSIGNMENT",
    rawBrief: "Implement the REST API authentication endpoints. Test token expiration edge cases. Commit your changes to GitHub.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "assign_09",
    category: "ASSIGNMENT",
    rawBrief: "Review the grading rubric. Revise your first draft based on peer feedback. Submit the final PDF.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "assign_10",
    category: "ASSIGNMENT",
    rawBrief: "Clone the repository. Install dependencies using npm. Verify that the build succeeds.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },

  // 11-20: Collaborative Group Projects & Handoffs
  {
    id: "group_01",
    category: "GROUP_HANDOFF",
    rawBrief: "Team will review the user interview notes. Sarah is responsible for creating wireframes. Marcus Vance will implement the frontend components.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 1, // First action unassigned in collaborative brief
    hasSequentialDependency: false,
  },
  {
    id: "group_02",
    category: "GROUP_HANDOFF",
    rawBrief: "Team must collect user feedback. Outline the sprint backlog. Schedule the retrospective meeting.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 3, // All 3 unassigned in team brief
    hasSequentialDependency: false,
  },
  {
    id: "group_03",
    category: "GROUP_HANDOFF",
    rawBrief: "Configure the deployment pipeline on AWS. Verify database connection pooling. Alex Chen is responsible for security audits.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: false,
  },
  {
    id: "group_04",
    category: "GROUP_HANDOFF",
    rawBrief: "Draft the project charter. Review technical risks. Submit the team proposal before Friday at 3:00 PM EST.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 1, // Format missing on submit
    hasSequentialDependency: true,
  },
  {
    id: "group_05",
    category: "GROUP_HANDOFF",
    rawBrief: "Team will setup the staging environment. Run load testing against the authentication service. Summarize the throughput metrics.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 3, // Team unassigned
    hasSequentialDependency: true,
  },
  {
    id: "group_06",
    category: "GROUP_HANDOFF",
    rawBrief: "Conduct user acceptance testing. Record demo video clips. Create the presentation slide deck.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "group_07",
    category: "GROUP_HANDOFF",
    rawBrief: "Review partner pull request. Fix merge conflicts in consensus branch. Push commits to origin.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "group_08",
    category: "GROUP_HANDOFF",
    rawBrief: "Team will outline system architecture. Configure Docker containers for microservices. Test inter-service gRPC communication.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 3,
    hasSequentialDependency: true,
  },
  {
    id: "group_09",
    category: "GROUP_HANDOFF",
    rawBrief: "Collect survey responses from 20 participants. Clean duplicate entries. Export results in CSV format.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "group_10",
    category: "GROUP_HANDOFF",
    rawBrief: "Draft the engineering release notes. Review with product manager. Publish the release tag on GitHub.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },

  // 21-28: Administrative University & Bureaucratic Processes
  {
    id: "admin_01",
    category: "ADMINISTRATIVE",
    rawBrief: "Download the fellowship grant application template. Complete the budget worksheet. Collect signatures from your department chair. Submit before October 30.",
    expectedMinActions: 4,
    expectedMaxActions: 4,
    expectedAmbiguities: 2, // Deadline without time zone, submit without format
    hasSequentialDependency: true,
  },
  {
    id: "admin_02",
    category: "ADMINISTRATIVE",
    rawBrief: "Verify graduation degree audit requirements with registrar. Schedule graduation advisor appointment. Submit graduation application.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 1, // Format missing on submit
    hasSequentialDependency: true,
  },
  {
    id: "admin_03",
    category: "ADMINISTRATIVE",
    rawBrief: "Review internship credit policies. Complete employer evaluation form. Upload signed supervisor letter in PDF format.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "admin_04",
    category: "ADMINISTRATIVE",
    rawBrief: "Download travel reimbursement expense form. Attach itemized receipts. Submit expense package to financial office.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 1, // Format missing
    hasSequentialDependency: true,
  },
  {
    id: "admin_05",
    category: "ADMINISTRATIVE",
    rawBrief: "Check prerequisite courses for Senior Capstone. Request faculty override permission. Register for section 02 on student portal.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "admin_06",
    category: "ADMINISTRATIVE",
    rawBrief: "Complete lab safety compliance certification. Attend hazardous materials training. Upload completion certificate.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 1, // Format missing
    hasSequentialDependency: true,
  },
  {
    id: "admin_07",
    category: "ADMINISTRATIVE",
    rawBrief: "Download study abroad approval packet. Schedule meeting with international programs advisor. Submit completed application by December 1.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 2,
    hasSequentialDependency: true,
  },
  {
    id: "admin_08",
    category: "ADMINISTRATIVE",
    rawBrief: "Review conference travel grant criteria. Draft statement of purpose. Request recommendation letter from faculty mentor.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: false,
  },

  // 29-34: Ambiguous Deadlines, Formats, and Vague Scopes
  {
    id: "ambig_01",
    category: "AMBIGUOUS",
    rawBrief: "Prepare a thorough presentation on machine learning ethics. Submit before next Tuesday.",
    expectedMinActions: 2,
    expectedMaxActions: 2,
    expectedAmbiguities: 3, // Vague 'thorough', deadline without time, submit without format
    hasSequentialDependency: true,
  },
  {
    id: "ambig_02",
    category: "AMBIGUOUS",
    rawBrief: "Provide several case examples of software failures. Analyze their root causes. Upload your report.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 2, // 'several', upload without format
    hasSequentialDependency: true,
  },
  {
    id: "ambig_03",
    category: "AMBIGUOUS",
    rawBrief: "Review the research literature. Write an appropriate summary of recent trends. Deliver your findings.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 2, // 'appropriate', deliver without format
    hasSequentialDependency: true,
  },
  {
    id: "ambig_04",
    category: "AMBIGUOUS",
    rawBrief: "Collect some benchmark samples. Calculate response times. Present results.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 1, // 'some'
    hasSequentialDependency: true,
  },
  {
    id: "ambig_05",
    category: "AMBIGUOUS",
    rawBrief: "Draft a detailed architectural proposal. Review with stakeholders.",
    expectedMinActions: 2,
    expectedMaxActions: 2,
    expectedAmbiguities: 1, // 'detailed'
    hasSequentialDependency: true,
  },
  {
    id: "ambig_06",
    category: "AMBIGUOUS",
    rawBrief: "Complete as many practice problems as possible. Check your answers against the key.",
    expectedMinActions: 2,
    expectedMaxActions: 2,
    expectedAmbiguities: 1, // 'as many... as possible'
    hasSequentialDependency: true,
  },

  // 35-38: Alternative Paths & Complex Dependencies
  {
    id: "dep_01",
    category: "DEPENDENCY_CHAIN",
    rawBrief: "Download starter files. Either write the backend in Go or choose Python. Test your implementation.",
    expectedMinActions: 3,
    expectedMaxActions: 4,
    expectedAmbiguities: 1, // Alternative choice
    hasSequentialDependency: true,
  },
  {
    id: "dep_02",
    category: "DEPENDENCY_CHAIN",
    rawBrief: "Download the dataset. Before modeling, clean the missing values. Evaluate the trained model.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "dep_03",
    category: "DEPENDENCY_CHAIN",
    rawBrief: "Review the project specification. After completing the database migration, implement the search API.",
    expectedMinActions: 3,
    expectedMaxActions: 3,
    expectedAmbiguities: 0,
    hasSequentialDependency: true,
  },
  {
    id: "dep_04",
    category: "DEPENDENCY_CHAIN",
    rawBrief: "Download syllabus. Either attend the in-person workshop or review the recorded webinar. Complete the quiz.",
    expectedMinActions: 3,
    expectedMaxActions: 4,
    expectedAmbiguities: 1,
    hasSequentialDependency: true,
  },

  // 39-40: Malformed & Minimal Edge Cases
  {
    id: "edge_01",
    category: "MALFORMED",
    rawBrief: "   \n\n  ",
    expectedMinActions: 0,
    expectedMaxActions: 0,
    expectedAmbiguities: 0,
    hasSequentialDependency: false,
  },
  {
    id: "edge_02",
    category: "MALFORMED",
    rawBrief: "General information paragraph with zero action verbs, zero obligations, and purely descriptive remarks about campus history.",
    expectedMinActions: 0,
    expectedMaxActions: 0,
    expectedAmbiguities: 0,
    hasSequentialDependency: false,
  },
];

export function runBenchmark() {
  console.log("=== Running ClarityRail Deterministic Compiler Benchmark ===");
  console.log(`Corpus Size: ${BENCHMARK_CORPUS.length} labelled synthetic briefs`);

  let totalExpectedActions = 0;
  let totalExtractedActions = 0;
  let totalCorrectActions = 0;
  let unsupportedSteps = 0;

  let totalExpectedAmbiguities = 0;
  let totalDetectedAmbiguities = 0;
  let correctAmbiguities = 0;

  let repeatabilityPassed = true;
  let stalePropagationPassed = true;
  let detourAccuracyPassed = true;

  for (const testCase of BENCHMARK_CORPUS) {
    const session1 = compileBrief(testCase.rawBrief, { sessionId: testCase.id, revisionId: `rev_${testCase.id}` });
    const session2 = compileBrief(testCase.rawBrief, { sessionId: testCase.id, revisionId: `rev_${testCase.id}` });

    // Check 100% deterministic repeatability
    if (JSON.stringify(session1.steps) !== JSON.stringify(session2.steps)) {
      repeatabilityPassed = false;
    }

    const actionCount = session1.steps.length;
    totalExtractedActions += actionCount;
    totalExpectedActions += testCase.expectedMinActions;

    if (actionCount >= testCase.expectedMinActions && actionCount <= testCase.expectedMaxActions) {
      totalCorrectActions += actionCount;
    } else {
      totalCorrectActions += Math.min(actionCount, testCase.expectedMaxActions);
    }

    // Check unsupported steps: every step must link to an actual clause
    for (const step of session1.steps) {
      if (!step.sourceClauseIds || step.sourceClauseIds.length === 0) {
        unsupportedSteps++;
      }
    }

    // Check ambiguities
    const ambCount = session1.ambiguities.length;
    totalDetectedAmbiguities += ambCount;
    totalExpectedAmbiguities += testCase.expectedAmbiguities;
    if (testCase.expectedAmbiguities > 0) {
      if (ambCount >= testCase.expectedAmbiguities) {
        correctAmbiguities += testCase.expectedAmbiguities;
      } else {
        correctAmbiguities += ambCount;
      }
    }
  }

  // Evaluate Revision Stale Invalidation Accuracy on fixture
  const fixture1 = BENCHMARK_CORPUS[0]!;
  const sInit = compileBrief(fixture1.rawBrief);
  const revText = "Download the assignment PDF. Review the lecture slides. Implement raft consensus in Go. Submit code before Friday.";
  const newClauses = segmentSourceText(revText, "rev_b");
  const impact = calculateRevisionImpact(sInit.sourceClauses, newClauses, sInit.steps, {
    id: "rev_b",
    sourceText: revText,
    normalizedDigest: "d_b",
    createdAt: new Date().toISOString(),
    changedClauseIds: newClauses.map((c) => c.id),
  });
  const staleSteps = applyRevisionStaleness(sInit.steps, impact, "rev_b");
  if (staleSteps.filter((s) => s.state === "STALE").length !== impact.allStaleStepIds.length) {
    stalePropagationPassed = false;
  }

  // Evaluate Safe Detour Accuracy
  const detourCheck = findDependencySafeDetour(sInit.steps[0]!.id, sInit.steps);
  if (detourCheck.isEligible && detourCheck.candidateStep?.id === sInit.steps[0]!.id) {
    detourAccuracyPassed = false;
  }

  const actionPrecision = totalExtractedActions > 0 ? (totalCorrectActions / totalExtractedActions) : 1;
  const actionRecall = totalExpectedActions > 0 ? (totalCorrectActions / totalExpectedActions) : 1;
  const actionF1 = (actionPrecision + actionRecall > 0)
    ? (2 * actionPrecision * actionRecall) / (actionPrecision + actionRecall)
    : 1;

  const ambiguityRecall = totalExpectedAmbiguities > 0 ? (correctAmbiguities / totalExpectedAmbiguities) : 1;

  const results = {
    benchmarkDate: new Date().toISOString(),
    corpusSize: BENCHMARK_CORPUS.length,
    metrics: {
      actionPrecision: parseFloat(actionPrecision.toFixed(3)),
      actionRecall: parseFloat(actionRecall.toFixed(3)),
      actionF1: parseFloat(actionF1.toFixed(3)),
      ambiguityRecall: parseFloat(ambiguityRecall.toFixed(3)),
      totalDetectedAmbiguities,
      unsupportedStepsCount: unsupportedSteps,
      repeatabilityPercent: repeatabilityPassed ? 100 : 0,
      stalePropagationAccuracyPercent: stalePropagationPassed ? 100 : 0,
      detourAccuracyPercent: detourAccuracyPassed ? 100 : 0,
    },
    thresholdsMet: {
      actionRecallGe90: actionRecall >= 0.90,
      actionPrecisionGe90: actionPrecision >= 0.90,
      ambiguityRecallGe90: ambiguityRecall >= 0.90,
      unsupportedStepsZero: unsupportedSteps === 0,
      repeatability100: repeatabilityPassed,
      stalePropagation100: stalePropagationPassed,
    },
  };

  console.log("Results Summary:", JSON.stringify(results, null, 2));

  // Save to docs/benchmark-results.json
  const outDir = path.resolve(process.cwd(), "docs");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outDir, "benchmark-results.json"),
    JSON.stringify(results, null, 2),
    "utf-8"
  );
  console.log(`Saved benchmark results to ${path.join(outDir, "benchmark-results.json")}`);
}

// Run when executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("run-benchmark.ts")) {
  runBenchmark();
}
