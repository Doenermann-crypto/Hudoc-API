import { useState } from "react";
import { Link } from "wouter";
import { BookOpen, Home, Code, Search, FileText, Globe, Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EndpointCard } from "@/components/endpoint-card";
import { MultiLanguageCodeBlock } from "@/components/code-block";
import type { ApiEndpoint } from "@shared/schema";
import { cn } from "@/lib/utils";

const sections = [
  { id: "introduction", label: "Introduction", icon: BookOpen },
  { id: "authentication", label: "Authentication", icon: Scale },
  { id: "rate-limiting", label: "Rate Limiting", icon: Scale },
  { id: "search", label: "Search Cases", icon: Search },
  { id: "case-detail", label: "Case Details", icon: FileText },
  { id: "articles", label: "Articles", icon: Code },
  { id: "countries", label: "Countries", icon: Globe },
];

const endpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/cases/search",
    description: "Search ECHR cases with various filters and full-text search",
    parameters: [
      { name: "query", type: "string", required: false, description: "Full-text search query", example: "privacy surveillance" },
      { name: "applicationNumber", type: "string", required: false, description: "Filter by application number", example: "12345/67" },
      { name: "caseTitle", type: "string", required: false, description: "Filter by case title", example: "Smith v. Country" },
      { name: "respondentState", type: "string", required: false, description: "ISO 3166-1 alpha-3 country code", example: "GBR" },
      { name: "article", type: "string", required: false, description: "ECHR article number", example: "8" },
      { name: "importance", type: "string", required: false, description: "Importance level (1-4)", example: "1" },
      { name: "documentType", type: "string", required: false, description: "Document type filter", example: "JUDGMENTS" },
      { name: "dateFrom", type: "string", required: false, description: "Start date (YYYY-MM-DD)", example: "2020-01-01" },
      { name: "dateTo", type: "string", required: false, description: "End date (YYYY-MM-DD)", example: "2024-12-31" },
      { name: "violation", type: "boolean", required: false, description: "Filter by violation found", example: "true" },
      { name: "page", type: "number", required: false, description: "Page number (default: 1)", example: "1" },
      { name: "pageSize", type: "number", required: false, description: "Results per page (1-100, default: 20)", example: "20" },
    ],
    responseExample: {
      results: [
        {
          itemid: "001-123456",
          docname: "CASE OF SMITH v. COUNTRY",
          appno: "12345/67",
          importance: "1",
          respondent: "GBR",
          conclusion: "Violation of Article 8",
          judgmentdate: "2024-01-15",
          article: ["8"],
          doctype: "JUDGMENT"
        }
      ],
      resultcount: 150,
      page: 1,
      pageSize: 20,
      totalPages: 8
    }
  },
  {
    method: "GET",
    path: "/api/cases/:id",
    description: "Get full details for a specific case including judgment text",
    parameters: [
      { name: "id", type: "string", required: true, description: "The case item ID from search results", example: "001-123456" },
    ],
    responseExample: {
      itemid: "001-123456",
      docname: "CASE OF SMITH v. COUNTRY",
      appno: "12345/67",
      importance: "1",
      respondent: "GBR",
      conclusion: "Violation of Article 8",
      judgmentdate: "2024-01-15",
      article: ["8"],
      doctype: "JUDGMENT",
      fullText: "THE FACTS...",
      summary: "The applicant complained about...",
      keywords: ["privacy", "surveillance", "data protection"],
      ecli: "ECLI:CE:ECHR:2024:0115JUD001234567"
    }
  },
  {
    method: "GET",
    path: "/api/articles",
    description: "List all ECHR Convention articles with descriptions",
    parameters: [],
    responseExample: {
      articles: [
        { code: "2", name: "Right to life", description: "Everyone's right to life shall be protected by law." },
        { code: "3", name: "Prohibition of torture", description: "No one shall be subjected to torture..." },
        { code: "8", name: "Right to respect for private and family life", description: "Everyone has the right to respect..." }
      ]
    }
  },
  {
    method: "GET",
    path: "/api/countries",
    description: "List all Council of Europe member states",
    parameters: [],
    responseExample: {
      countries: [
        { code: "GBR", name: "United Kingdom" },
        { code: "FRA", name: "France" },
        { code: "DEU", name: "Germany" }
      ]
    }
  },
  {
    method: "GET",
    path: "/api/status",
    description: "Get API health status and cache statistics",
    parameters: [],
    responseExample: {
      status: "operational",
      uptime: 86400,
      lastCheck: "2024-01-15T12:00:00Z",
      cacheStats: {
        hits: 1500,
        misses: 300,
        hitRate: 0.83,
        size: 250
      },
      rateLimitRemaining: 95
    }
  }
];

const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

export default function Docs() {
  const [activeSection, setActiveSection] = useState("introduction");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="docs-page">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="font-semibold">API Documentation</h1>
          </div>
          <Link href="/explorer">
            <Button size="sm" className="gap-2" data-testid="button-go-explorer">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Try</span> Explorer
            </Button>
          </Link>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="sticky top-20 py-8">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="space-y-1 pr-4">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                        activeSection === section.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover-elevate"
                      )}
                      data-testid={`nav-${section.id}`}
                    >
                      <section.icon className="h-4 w-4 shrink-0" />
                      {section.label}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </nav>
          </aside>

          <main className="flex-1 py-8 min-w-0">
            <div className="max-w-4xl space-y-16">
              <section id="introduction" className="scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4" data-testid="text-section-title-intro">Introduction</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The HUDOC API provides programmatic access to the European Court of Human Rights case law database. 
                  This API wraps the official HUDOC database, providing a clean REST interface with structured JSON responses 
                  optimized for legal research applications and AI/LLM integration.
                </p>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-semibold mb-2">Base URL</h4>
                  <code className="text-sm font-mono bg-background px-3 py-1.5 rounded border">{baseUrl}/api</code>
                </div>
              </section>

              <section id="authentication" className="scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Authentication</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  This API currently does not require authentication. All endpoints are publicly accessible.
                  Rate limiting is applied to prevent abuse.
                </p>
                <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <p className="text-sm">
                    <strong className="text-amber-600 dark:text-amber-400">Note:</strong> Future versions may require 
                    API keys for higher rate limits and analytics. Subscribe to updates for changes.
                  </p>
                </div>
              </section>

              <section id="rate-limiting" className="scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Rate Limiting</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  To protect both the API and the upstream HUDOC database, rate limiting is enforced:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li><strong>100 requests per minute</strong> per IP address</li>
                  <li>Responses include rate limit headers</li>
                  <li>Cached responses do not count against limits</li>
                </ul>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h4 className="font-semibold mb-2">Rate Limit Headers</h4>
                  <pre className="text-sm font-mono">
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800`}
                  </pre>
                </div>
              </section>

              <section id="search" className="scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Search Cases</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Search the ECHR case law database with powerful filtering options. 
                  Combine multiple parameters for precise results.
                </p>
                <EndpointCard endpoint={endpoints[0]} baseUrl={baseUrl} />
              </section>

              <section id="case-detail" className="scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Case Details</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Retrieve complete case information including full judgment text, metadata, and extracted keywords.
                </p>
                <EndpointCard endpoint={endpoints[1]} baseUrl={baseUrl} />
              </section>

              <section id="articles" className="scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Articles</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Get information about ECHR Convention articles including their official names and descriptions.
                </p>
                <EndpointCard endpoint={endpoints[2]} baseUrl={baseUrl} />
              </section>

              <section id="countries" className="scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Countries</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  List all Council of Europe member states that can appear as respondent parties in ECHR cases.
                </p>
                <EndpointCard endpoint={endpoints[3]} baseUrl={baseUrl} />
              </section>

              <section id="status" className="scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">API Status</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Check the health status of the API and view cache statistics.
                </p>
                <EndpointCard endpoint={endpoints[4]} baseUrl={baseUrl} />
              </section>

              <section className="scroll-mt-20 pb-16">
                <h2 className="text-3xl font-bold mb-4">Error Handling</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The API returns standard HTTP status codes and JSON error responses:
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="secondary">400</Badge>
                        <span className="font-medium">Bad Request</span>
                      </div>
                    </div>
                    <pre className="p-4 text-sm font-mono overflow-x-auto">
{`{
  "error": "Invalid parameter",
  "message": "The 'pageSize' parameter must be between 1 and 100",
  "code": "INVALID_PARAM"
}`}
                    </pre>
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="secondary">404</Badge>
                        <span className="font-medium">Not Found</span>
                      </div>
                    </div>
                    <pre className="p-4 text-sm font-mono overflow-x-auto">
{`{
  "error": "Case not found",
  "message": "No case found with ID: 001-invalid",
  "code": "NOT_FOUND"
}`}
                    </pre>
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="secondary">429</Badge>
                        <span className="font-medium">Too Many Requests</span>
                      </div>
                    </div>
                    <pre className="p-4 text-sm font-mono overflow-x-auto">
{`{
  "error": "Rate limit exceeded",
  "message": "Please wait before making more requests",
  "code": "RATE_LIMITED",
  "retryAfter": 60
}`}
                    </pre>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
