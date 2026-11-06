export type QueryClassification =
  | 'question_answering'
  | 'paper_summarization'
  | 'paper_comparison'
  | 'research_gap_analysis'
  | 'experiment_planning';

export interface DocumentRecord {
  id: string;
  filename: string;
  displayName: string;
  filesize: number;
  uploadedAt: string;
  pageCount: number;
  status: 'uploading' | 'indexing' | 'ready' | 'error';
  error?: string;
  fileSearchDocumentName?: string;
  filePath?: string;
  abstractSnippet?: string;
  authors?: string;
  pages: Array<{ pageNumber: number; text: string }>;
  isSample?: boolean;
}

export interface Citation {
  id: string;
  documentId: string;
  documentTitle: string;
  pageNumber?: number;
  snippet: string;
  confidence?: number;
  verified: boolean;
}

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'retrying' | 'failed';

export interface AgentStep {
  id: string;
  name: string;
  stepType: 'query_planning' | 'retrieval' | 'evidence_check' | 'response_generation';
  status: StepStatus;
  timestamp: string;
  durationMs?: number;
  summary: string;
  details?: Record<string, any>;
}

export interface ComparisonTableRow {
  axis: 'Research Problem' | 'Proposed Methodology' | 'Dataset Used' | 'Performance Metrics' | 'Results' | 'Limitations';
  papers: Record<string, string>; // documentTitle -> content
  citations: string[];
}

export interface ExperimentPlan {
  researchObjective: string;
  proposedExperiment: string;
  possibleMethodology: string;
  evaluationMetrics: string;
  expectedChallenges: string;
  distinctionNote: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  classification?: QueryClassification;
  agentSteps?: AgentStep[];
  citations?: Citation[];
  comparisonTable?: ComparisonTableRow[];
  experimentPlan?: ExperimentPlan;
  retryOccurred?: boolean;
  selectedDocumentIds?: string[];
  executionTimeMs?: number;
}

export interface TestCase {
  id: string;
  title: string;
  category: QueryClassification;
  prompt: string;
  targetPapers: string[];
  expectedAspects: string[];
  isNegativeTest?: boolean;
  explanation: string;
}
