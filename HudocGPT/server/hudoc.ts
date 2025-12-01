import axios from "axios";
import NodeCache from "node-cache";
import type { HudocCase, HudocCaseDetail, SearchParams, SearchResult } from "@shared/schema";

const HUDOC_BASE_URL = "https://hudoc.echr.coe.int/app";
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

let cacheHits = 0;
let cacheMisses = 0;
let startTime = Date.now();

export const getCacheStats = () => ({
  hits: cacheHits,
  misses: cacheMisses,
  hitRate: cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0,
  size: cache.keys().length,
});

export const getUptime = () => Math.floor((Date.now() - startTime) / 1000);

const sanitizeQueryValue = (value: string): string => {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/[()[\]{}^~*?:!]/g, "\\$&")
    .trim();
};

const buildHudocQuery = (params: Partial<SearchParams>): string => {
  const filters: string[] = [];
  
  if (params.query) {
    filters.push(`"${sanitizeQueryValue(params.query)}"`);
  }
  
  if (params.applicationNumber) {
    filters.push(`appno:"${sanitizeQueryValue(params.applicationNumber)}"`);
  }
  
  if (params.caseTitle) {
    filters.push(`docname:"${sanitizeQueryValue(params.caseTitle)}"`);
  }
  
  if (params.respondentState) {
    filters.push(`respondent:"${params.respondentState}"`);
  }
  
  if (params.article) {
    filters.push(`article:"${params.article}"`);
  }
  
  if (params.importance) {
    filters.push(`importance:"${params.importance}"`);
  }
  
  if (params.documentType) {
    filters.push(`documentcollectionid2:"${params.documentType}"`);
  }
  
  if (params.dateFrom) {
    filters.push(`kpdate>="${params.dateFrom}"`);
  }
  
  if (params.dateTo) {
    filters.push(`kpdate<="${params.dateTo}"`);
  }
  
  if (params.violation === true) {
    filters.push(`conclusion:"violation"`);
  }
  
  return filters.length > 0 ? filters.join(" AND ") : "*";
};

export async function searchCases(params: Partial<SearchParams>): Promise<SearchResult> {
  const page = params.page || 1;
  const pageSize = Math.min(Math.max(params.pageSize || 20, 1), 100);
  const start = (page - 1) * pageSize;
  
  const query = buildHudocQuery(params);
  const cacheKey = `search:${query}:${start}:${pageSize}`;
  
  const cached = cache.get<SearchResult>(cacheKey);
  if (cached) {
    cacheHits++;
    return cached;
  }
  cacheMisses++;

  try {
    const response = await axios.get(`${HUDOC_BASE_URL}/query/results`, {
      params: {
        query: query,
        select: "itemid,docname,appno,importance,originatingbody,respondent,conclusion,kpdate,judgmentdate,article,doctype,languageisocode,ecli",
        sort: "kpdate Descending",
        start: start,
        length: pageSize,
      },
      headers: {
        "Accept": "application/json",
        "User-Agent": "HUDOC-API-Wrapper/1.0",
      },
      timeout: 30000,
    });

    const data = response.data;
    
    const results: HudocCase[] = (data.results || []).map((item: Record<string, unknown>) => ({
      itemid: String(item.itemid || ""),
      docname: String(item.docname || ""),
      appno: String(item.appno || ""),
      importance: String(item.importance || "4"),
      originatingbody: String(item.originatingbody || ""),
      respondent: String(item.respondent || "").split(";")[0]?.trim() || "",
      conclusion: String(item.conclusion || ""),
      kpdate: String(item.kpdate || ""),
      judgmentdate: String(item.judgmentdate || ""),
      article: Array.isArray(item.article) 
        ? item.article.map(String) 
        : String(item.article || "").split(";").filter(Boolean).map(a => a.trim()),
      doctype: String(item.doctype || ""),
      languageisocode: String(item.languageisocode || "ENG"),
      ecli: String(item.ecli || ""),
    }));

    const totalCount = Number(data.resultcount) || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const result: SearchResult = {
      results,
      resultcount: totalCount,
      page,
      pageSize,
      totalPages,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("HUDOC search error:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Request to HUDOC timed out. Please try again.");
      }
      if (error.response?.status === 503) {
        throw new Error("HUDOC service is temporarily unavailable. Please try again later.");
      }
    }
    
    throw new Error("Failed to search HUDOC database. Please try again.");
  }
}

export async function getCaseById(id: string): Promise<HudocCaseDetail | null> {
  const cacheKey = `case:${id}`;
  
  const cached = cache.get<HudocCaseDetail>(cacheKey);
  if (cached) {
    cacheHits++;
    return cached;
  }
  cacheMisses++;

  try {
    const response = await axios.get(`${HUDOC_BASE_URL}/query/results`, {
      params: {
        query: `itemid:"${id}"`,
        select: "itemid,docname,appno,importance,originatingbody,respondent,conclusion,kpdate,judgmentdate,article,doctype,languageisocode,ecli,externalsources,separateopinion",
      },
      headers: {
        "Accept": "application/json",
        "User-Agent": "HUDOC-API-Wrapper/1.0",
      },
      timeout: 30000,
    });

    const results = response.data.results || [];
    if (results.length === 0) {
      return null;
    }

    const item = results[0];
    
    let fullText = "";
    let summary = "";
    let keywords: string[] = [];

    try {
      const docResponse = await axios.get(`https://hudoc.echr.coe.int/app/conversion/docx/?library=ECHR&id=${id}`, {
        responseType: "text",
        timeout: 30000,
        headers: {
          "User-Agent": "HUDOC-API-Wrapper/1.0",
        },
      });
      
      if (docResponse.data) {
        const text = String(docResponse.data);
        fullText = text.substring(0, 50000);
        
        const procedureMatch = text.match(/PROCEDURE[\s\S]*?(?=THE FACTS|I\.\s+THE CIRCUMSTANCES)/i);
        if (procedureMatch) {
          summary = procedureMatch[0].substring(0, 2000);
        }
        
        const keywordMatches = text.match(/Keywords?:?\s*([^\n]+)/i);
        if (keywordMatches) {
          keywords = keywordMatches[1].split(/[,;]/).map(k => k.trim()).filter(Boolean);
        }
      }
    } catch (docError) {
      console.log("Could not fetch document text, continuing with metadata only");
    }

    const caseDetail: HudocCaseDetail = {
      itemid: String(item.itemid || ""),
      docname: String(item.docname || ""),
      appno: String(item.appno || ""),
      importance: String(item.importance || "4"),
      originatingbody: String(item.originatingbody || ""),
      respondent: String(item.respondent || "").split(";")[0]?.trim() || "",
      conclusion: String(item.conclusion || ""),
      kpdate: String(item.kpdate || ""),
      judgmentdate: String(item.judgmentdate || ""),
      article: Array.isArray(item.article)
        ? item.article.map(String)
        : String(item.article || "").split(";").filter(Boolean).map(a => a.trim()),
      doctype: String(item.doctype || ""),
      languageisocode: String(item.languageisocode || "ENG"),
      ecli: String(item.ecli || ""),
      externalsources: String(item.externalsources || ""),
      separateopinion: Boolean(item.separateopinion),
      fullText: fullText || undefined,
      summary: summary || undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
    };

    cache.set(cacheKey, caseDetail, 3600);
    return caseDetail;
  } catch (error) {
    console.error("HUDOC case fetch error:", error);
    throw new Error("Failed to fetch case details from HUDOC database.");
  }
}

export const articleDescriptions: Record<string, { name: string; description: string }> = {
  "2": { name: "Right to life", description: "Everyone's right to life shall be protected by law." },
  "3": { name: "Prohibition of torture", description: "No one shall be subjected to torture or to inhuman or degrading treatment or punishment." },
  "4": { name: "Prohibition of slavery and forced labour", description: "No one shall be held in slavery or servitude or required to perform forced or compulsory labour." },
  "5": { name: "Right to liberty and security", description: "Everyone has the right to liberty and security of person." },
  "6": { name: "Right to a fair trial", description: "Everyone is entitled to a fair and public hearing within a reasonable time." },
  "7": { name: "No punishment without law", description: "No one shall be held guilty of any criminal offence which did not constitute a criminal offence at the time." },
  "8": { name: "Right to respect for private and family life", description: "Everyone has the right to respect for his private and family life, his home and his correspondence." },
  "9": { name: "Freedom of thought, conscience and religion", description: "Everyone has the right to freedom of thought, conscience and religion." },
  "10": { name: "Freedom of expression", description: "Everyone has the right to freedom of expression, including freedom to hold opinions and to receive and impart information." },
  "11": { name: "Freedom of assembly and association", description: "Everyone has the right to freedom of peaceful assembly and to freedom of association with others." },
  "12": { name: "Right to marry", description: "Men and women of marriageable age have the right to marry and to found a family." },
  "13": { name: "Right to an effective remedy", description: "Everyone whose rights and freedoms are violated shall have an effective remedy before a national authority." },
  "14": { name: "Prohibition of discrimination", description: "The enjoyment of the rights shall be secured without discrimination on any ground." },
  "P1-1": { name: "Protection of property", description: "Every natural or legal person is entitled to the peaceful enjoyment of his possessions." },
  "P1-2": { name: "Right to education", description: "No person shall be denied the right to education." },
  "P1-3": { name: "Right to free elections", description: "The Parties undertake to hold free elections at reasonable intervals by secret ballot." },
  "P4-2": { name: "Freedom of movement", description: "Everyone lawfully within the territory of a State shall have the right to liberty of movement." },
  "P4-4": { name: "Prohibition of collective expulsion of aliens", description: "Collective expulsion of aliens is prohibited." },
  "P6-1": { name: "Abolition of the death penalty", description: "The death penalty shall be abolished." },
  "P7-1": { name: "Procedural safeguards relating to expulsion of aliens", description: "An alien lawfully resident shall not be expelled except by a lawful decision." },
  "P7-2": { name: "Right of appeal in criminal matters", description: "Everyone convicted of a criminal offence has the right to have conviction or sentence reviewed." },
  "P7-4": { name: "Right not to be tried or punished twice", description: "No one shall be liable to be tried or punished again for an offence already finally acquitted or convicted." },
};

export const countryNames: Record<string, string> = {
  ALB: "Albania", AND: "Andorra", ARM: "Armenia", AUT: "Austria", AZE: "Azerbaijan",
  BEL: "Belgium", BIH: "Bosnia and Herzegovina", BGR: "Bulgaria", HRV: "Croatia",
  CYP: "Cyprus", CZE: "Czech Republic", DNK: "Denmark", EST: "Estonia", FIN: "Finland",
  FRA: "France", GEO: "Georgia", DEU: "Germany", GRC: "Greece", HUN: "Hungary",
  ISL: "Iceland", IRL: "Ireland", ITA: "Italy", LVA: "Latvia", LIE: "Liechtenstein",
  LTU: "Lithuania", LUX: "Luxembourg", MLT: "Malta", MDA: "Moldova", MCO: "Monaco",
  MNE: "Montenegro", NLD: "Netherlands", MKD: "North Macedonia", NOR: "Norway",
  POL: "Poland", PRT: "Portugal", ROU: "Romania", RUS: "Russia", SMR: "San Marino",
  SRB: "Serbia", SVK: "Slovakia", SVN: "Slovenia", ESP: "Spain", SWE: "Sweden",
  CHE: "Switzerland", TUR: "Turkey", UKR: "Ukraine", GBR: "United Kingdom"
};

export async function getBulkCases(
  caseIds: string[],
  includeFullText: boolean = false
): Promise<{ cases: HudocCaseDetail[]; errors: Array<{ id: string; error: string }> }> {
  const cases: HudocCaseDetail[] = [];
  const errors: Array<{ id: string; error: string }> = [];

  const batchSize = 5;
  for (let i = 0; i < caseIds.length; i += batchSize) {
    const batch = caseIds.slice(i, i + batchSize);
    const promises = batch.map(async (id) => {
      try {
        const caseData = await getCaseById(id);
        if (caseData) {
          if (!includeFullText) {
            const { fullText, ...rest } = caseData;
            return { success: true, data: rest as HudocCaseDetail, id };
          }
          return { success: true, data: caseData, id };
        } else {
          return { success: false, error: "Case not found", id };
        }
      } catch (error) {
        return { success: false, error: (error as Error).message, id };
      }
    });

    const results = await Promise.all(promises);
    for (const result of results) {
      if (result.success && result.data) {
        cases.push(result.data);
      } else if (!result.success) {
        errors.push({ id: result.id, error: result.error || "Unknown error" });
      }
    }
  }

  return { cases, errors };
}

export function convertToCsv(cases: HudocCaseDetail[]): string {
  if (cases.length === 0) return "";

  const headers = [
    "Item ID",
    "Case Name",
    "Application Number",
    "Respondent State",
    "Judgment Date",
    "Conclusion",
    "Articles",
    "Importance",
    "Document Type",
    "ECLI",
    "Language"
  ];

  const rows = cases.map((c) => [
    c.itemid,
    `"${(c.docname || "").replace(/"/g, '""')}"`,
    c.appno,
    c.respondent,
    c.judgmentdate || c.kpdate,
    `"${(c.conclusion || "").replace(/"/g, '""')}"`,
    `"${(c.article || []).join("; ")}"`,
    c.importance,
    c.doctype,
    c.ecli || "",
    c.languageisocode
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export interface AdvancedSearchOptions {
  query?: string;
  applicationNumber?: string;
  caseTitle?: string;
  respondentStates?: string[];
  articles?: string[];
  importance?: string;
  documentType?: string;
  dateFrom?: string;
  dateTo?: string;
  violation?: boolean;
  language?: string;
  page?: number;
  pageSize?: number;
}

export async function advancedSearchCases(params: AdvancedSearchOptions): Promise<SearchResult> {
  const page = params.page || 1;
  const pageSize = Math.min(Math.max(params.pageSize || 20, 1), 100);
  const start = (page - 1) * pageSize;

  const filters: string[] = [];

  if (params.query) {
    filters.push(`"${sanitizeQueryValue(params.query)}"`);
  }

  if (params.applicationNumber) {
    filters.push(`appno:"${sanitizeQueryValue(params.applicationNumber)}"`);
  }

  if (params.caseTitle) {
    filters.push(`docname:"${sanitizeQueryValue(params.caseTitle)}"`);
  }

  if (params.respondentStates && params.respondentStates.length > 0) {
    const stateQueries = params.respondentStates.map((s) => `respondent:"${s}"`);
    filters.push(`(${stateQueries.join(" OR ")})`);
  }

  if (params.articles && params.articles.length > 0) {
    const articleQueries = params.articles.map((a) => `article:"${a}"`);
    filters.push(`(${articleQueries.join(" OR ")})`);
  }

  if (params.importance) {
    filters.push(`importance:"${params.importance}"`);
  }

  if (params.documentType) {
    filters.push(`documentcollectionid2:"${params.documentType}"`);
  }

  if (params.dateFrom) {
    filters.push(`kpdate>="${params.dateFrom}"`);
  }

  if (params.dateTo) {
    filters.push(`kpdate<="${params.dateTo}"`);
  }

  if (params.violation === true) {
    filters.push(`conclusion:"violation"`);
  }

  if (params.language) {
    filters.push(`languageisocode:"${params.language}"`);
  }

  const query = filters.length > 0 ? filters.join(" AND ") : "*";
  const cacheKey = `adv_search:${query}:${start}:${pageSize}`;

  const cached = cache.get<SearchResult>(cacheKey);
  if (cached) {
    cacheHits++;
    return cached;
  }
  cacheMisses++;

  try {
    const response = await axios.get(`${HUDOC_BASE_URL}/query/results`, {
      params: {
        query: query,
        select: "itemid,docname,appno,importance,originatingbody,respondent,conclusion,kpdate,judgmentdate,article,doctype,languageisocode,ecli",
        sort: "kpdate Descending",
        start: start,
        length: pageSize,
      },
      headers: {
        "Accept": "application/json",
        "User-Agent": "HUDOC-API-Wrapper/1.0",
      },
      timeout: 30000,
    });

    const data = response.data;

    const results: HudocCase[] = (data.results || []).map((item: Record<string, unknown>) => ({
      itemid: String(item.itemid || ""),
      docname: String(item.docname || ""),
      appno: String(item.appno || ""),
      importance: String(item.importance || "4"),
      originatingbody: String(item.originatingbody || ""),
      respondent: String(item.respondent || "").split(";")[0]?.trim() || "",
      conclusion: String(item.conclusion || ""),
      kpdate: String(item.kpdate || ""),
      judgmentdate: String(item.judgmentdate || ""),
      article: Array.isArray(item.article)
        ? item.article.map(String)
        : String(item.article || "").split(";").filter(Boolean).map((a) => a.trim()),
      doctype: String(item.doctype || ""),
      languageisocode: String(item.languageisocode || "ENG"),
      ecli: String(item.ecli || ""),
    }));

    const totalCount = Number(data.resultcount) || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const result: SearchResult = {
      results,
      resultcount: totalCount,
      page,
      pageSize,
      totalPages,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("HUDOC advanced search error:", error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Request to HUDOC timed out. Please try again.");
      }
      if (error.response?.status === 503) {
        throw new Error("HUDOC service is temporarily unavailable. Please try again later.");
      }
    }

    throw new Error("Failed to search HUDOC database. Please try again.");
  }
}
