export interface SyntheticBriefFixture {
  id: string;
  category: "ACADEMIC" | "COLLABORATIVE" | "ADMINISTRATIVE";
  title: string;
  description: string;
  initialBriefText: string;
  revisedBriefText?: string;
  revisedClauseNote?: string;
}

export const SYNTHETIC_FIXTURES: SyntheticBriefFixture[] = [
  {
    id: "fixture_academic_cs401",
    category: "ACADEMIC",
    title: "CS 401 — Distributed Systems Final Assignment",
    description: "Multi-part university assignment with ambiguous deadline time zone and sequential build steps.",
    initialBriefText: `CS 401: Distributed Consensus Protocol Implementation & Analysis.
Please download the lab starter repository from GitHub.
Review the Raft consensus specification in Section 3 of the handout.
Implement the leader election state machine in consensus.go.
Run the local consensus unit test suite to verify election timeouts.
Draft a 4-page experimental evaluation report analyzing failover latency.
Submit your final implementation and evaluation report by Friday.`,
    revisedBriefText: `CS 401: Distributed Consensus Protocol Implementation & Analysis.
Please download the lab starter repository from GitHub.
Review the Raft consensus specification in Section 3 of the handout.
Implement the leader election state machine in consensus.go.
Run the local consensus unit test suite to verify election timeouts.
Draft a 6-page experimental evaluation report including Paxos comparison.
Submit your final implementation and evaluation report by Friday.`,
    revisedClauseNote: "Professor expanded the report requirement from 4 pages to 6 pages including Paxos comparison.",
  },
  {
    id: "fixture_group_capstone",
    category: "COLLABORATIVE",
    title: "Bioinformatics Capstone — Group Project Handoff",
    description: "Collaborative project brief with unassigned roles, parallel analysis, and deliverables.",
    initialBriefText: `Senior Capstone Team Alpha: Genomic Variant Pipeline.
Team will collect the raw sequence files from the lab cluster.
Configure the Snakemake workflow for alignment against GRCh38.
Run alignment and call small variants using the default parameters.
Sarah is responsible for writing the variant annotation scripts.
Create the final presentation slide deck for the departmental review.
Submit the team report before next Monday at 5:00 PM EST.`,
    revisedBriefText: `Senior Capstone Team Alpha: Genomic Variant Pipeline.
Team will collect the raw sequence files from the lab cluster.
Configure the Snakemake workflow for alignment against GRCh38.
Run alignment and call small variants using the default parameters.
Sarah is responsible for writing the variant annotation scripts.
Create the final presentation slide deck and video demonstration.
Submit the team report before next Monday at 5:00 PM EST.`,
    revisedClauseNote: "Instructor added a required video demonstration to the final presentation deliverable.",
  },
  {
    id: "fixture_admin_grant",
    category: "ADMINISTRATIVE",
    title: "Campus Innovation Fellowship — Grant Application",
    description: "Complex administrative university process with eligibility verification, budget templates, and formatting.",
    initialBriefText: `Office of Research: Undergraduate Innovation Grant Application Guidelines.
Download the official Fellowship Budget Spreadsheet template from the faculty portal.
Verify student enrollment eligibility and GPA prerequisites with your department advisor.
Draft your 2-page project proposal narrative detailing community impact.
Collect signed letters of endorsement from two faculty sponsors.
Either submit an executive summary or attend the in-person grant pitch workshop.
Upload the complete grant application package in PDF format by November 15.`,
    revisedBriefText: `Office of Research: Undergraduate Innovation Grant Application Guidelines.
Download the official Fellowship Budget Spreadsheet template from the faculty portal.
Verify student enrollment eligibility and GPA prerequisites with your department advisor.
Draft your 3-page project proposal narrative detailing community impact and commercial feasibility.
Collect signed letters of endorsement from two faculty sponsors.
Either submit an executive summary or attend the in-person grant pitch workshop.
Upload the complete grant application package in PDF format by November 15.`,
    revisedClauseNote: "Research office increased proposal narrative length and added commercial feasibility criteria.",
  },
];
