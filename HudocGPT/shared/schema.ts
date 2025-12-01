import { z } from "zod";

export const echrArticles = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14",
  "P1-1", "P1-2", "P1-3", "P4-2", "P4-4", "P6-1", "P7-1", "P7-2", "P7-4"
] as const;

export const importanceLevels = ["1", "2", "3", "4"] as const;

export const documentTypes = [
  "JUDGMENTS",
  "DECISIONS", 
  "COMMUNICATEDCASES",
  "ADVISORYOPINIONS",
  "REPORTS",
  "RESOLUTIONS"
] as const;

export const countries = [
  "ALB", "AND", "ARM", "AUT", "AZE", "BEL", "BIH", "BGR", "HRV", "CYP",
  "CZE", "DNK", "EST", "FIN", "FRA", "GEO", "DEU", "GRC", "HUN", "ISL",
  "IRL", "ITA", "LVA", "LIE", "LTU", "LUX", "MLT", "MDA", "MCO", "MNE",
  "NLD", "MKD", "NOR", "POL", "PRT", "ROU", "RUS", "SMR", "SRB", "SVK",
  "SVN", "ESP", "SWE", "CHE", "TUR", "UKR", "GBR"
] as const;

export const searchParamsSchema = z.object({
  query: z.string().optional(),
  applicationNumber: z.string().optional(),
  caseTitle: z.string().optional(),
  respondentState: z.enum(countries).optional(),
  article: z.enum(echrArticles).optional(),
  importance: z.enum(importanceLevels).optional(),
  documentType: z.enum(documentTypes).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  violation: z.boolean().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20)
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export interface HudocCase {
  itemid: string;
  docname: string;
  appno: string;
  importance: string;
  originatingbody: string;
  respondent: string;
  conclusion: string;
  kpdate: string;
  judgmentdate: string;
  article: string[];
  doctype: string;
  languageisocode: string;
  sharepointid?: string;
  externalsources?: string;
  ecli?: string;
  separateopinion?: boolean;
}

export interface HudocCaseDetail extends HudocCase {
  fullText?: string;
  summary?: string;
  keywords?: string[];
  extractedText?: string;
}

export interface SearchResult {
  results: HudocCase[];
  resultcount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiEndpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  parameters: ApiParameter[];
  responseExample: object;
}

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
}

export interface ApiStatus {
  status: "operational" | "degraded" | "down";
  uptime: number;
  lastCheck: string;
  cacheStats: CacheStats;
  rateLimitRemaining: number;
}

// Bulk download types
export const bulkDownloadSchema = z.object({
  caseIds: z.array(z.string()).min(1).max(50),
  format: z.enum(["json", "csv"]).default("json"),
  includeFullText: z.boolean().default(false),
});

export type BulkDownloadParams = z.infer<typeof bulkDownloadSchema>;

export interface BulkDownloadResult {
  cases: HudocCaseDetail[];
  totalRequested: number;
  totalRetrieved: number;
  errors: Array<{ id: string; error: string }>;
}

// Advanced search with multiple filters
export const advancedSearchParamsSchema = z.object({
  query: z.string().optional(),
  applicationNumber: z.string().optional(),
  caseTitle: z.string().optional(),
  respondentStates: z.array(z.enum(countries)).optional(),
  articles: z.array(z.enum(echrArticles)).optional(),
  importance: z.enum(importanceLevels).optional(),
  documentType: z.enum(documentTypes).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  violation: z.boolean().optional(),
  language: z.enum(["ENG", "FRA"]).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

export type AdvancedSearchParams = z.infer<typeof advancedSearchParamsSchema>;

export const languages = ["ENG", "FRA"] as const;
