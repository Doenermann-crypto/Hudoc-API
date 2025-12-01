import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Send, Loader2, AlertCircle, ExternalLink, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchFilters } from "@/components/search-filters";
import { CaseCard } from "@/components/case-card";
import { Pagination } from "@/components/pagination";
import { CodeBlock } from "@/components/code-block";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SearchParams, SearchResult, HudocCaseDetail, HudocCase, BulkDownloadResult } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Explorer() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedCase, setSelectedCase] = useState<HudocCaseDetail | null>(null);
  const [lastRequest, setLastRequest] = useState<{ url: string; params: Partial<SearchParams> } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());

  const searchMutation = useMutation({
    mutationFn: async (params: Partial<SearchParams>) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.append(key, String(value));
        }
      });
      searchParams.set("page", String(page));
      searchParams.set("pageSize", String(pageSize));
      
      const url = `/api/cases/search?${searchParams.toString()}`;
      setLastRequest({ url, params: { ...params, page, pageSize } });
      
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Search failed");
      }
      return response.json() as Promise<SearchResult>;
    },
    onSuccess: (data) => {
      setSearchResult(data);
      setSelectedCase(null);
      setSelectedCaseIds(new Set());
    },
  });

  const caseMutation = useMutation({
    mutationFn: async (id: string) => {
      const url = `/api/cases/${encodeURIComponent(id)}`;
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch case");
      }
      return response.json() as Promise<HudocCaseDetail>;
    },
    onSuccess: (data) => {
      setSelectedCase(data);
      setActiveTab("response");
    },
  });

  const bulkDownloadMutation = useMutation({
    mutationFn: async ({ caseIds, format }: { caseIds: string[]; format: "json" | "csv" }) => {
      const response = await fetch("/api/cases/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseIds,
          format,
          includeFullText: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const filename = format === "csv" ? "hudoc-cases.csv" : "hudoc-cases.json";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    },
  });

  const handleSearch = (params: Partial<SearchParams>) => {
    setPage(1);
    searchMutation.mutate(params);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (lastRequest) {
      searchMutation.mutate(lastRequest.params);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    if (lastRequest) {
      searchMutation.mutate(lastRequest.params);
    }
  };

  const handleCaseClick = (caseData: { itemid: string }) => {
    caseMutation.mutate(caseData.itemid);
  };

  const toggleCaseSelection = (caseId: string) => {
    setSelectedCaseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(caseId)) {
        newSet.delete(caseId);
      } else if (newSet.size < 50) {
        newSet.add(caseId);
      }
      return newSet;
    });
  };

  const selectAllVisible = () => {
    if (searchResult) {
      const newSet = new Set(selectedCaseIds);
      searchResult.results.slice(0, 50 - selectedCaseIds.size).forEach((c) => {
        if (newSet.size < 50) {
          newSet.add(c.itemid);
        }
      });
      setSelectedCaseIds(newSet);
    }
  };

  const deselectAll = () => {
    setSelectedCaseIds(new Set());
  };

  const handleBulkDownload = (format: "json" | "csv") => {
    const caseIds = Array.from(selectedCaseIds);
    bulkDownloadMutation.mutate({ caseIds, format });
  };

  const isLoading = searchMutation.isPending || caseMutation.isPending;
  const error = searchMutation.error || caseMutation.error;

  return (
    <div className="min-h-screen bg-background" data-testid="explorer-page">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="font-semibold">API Explorer</h1>
          </div>
          <Link href="/docs">
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-go-docs">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">View</span> Docs
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" data-testid="text-explorer-title">Interactive API Explorer</h2>
          <p className="text-muted-foreground">
            Test the HUDOC API endpoints in real-time. Search for cases, apply filters, and view structured responses.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>Request Builder</CardTitle>
                    <CardDescription>Configure your search parameters</CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    GET /api/cases/search
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <SearchFilters onSearch={handleSearch} isLoading={isLoading} />
              </CardContent>
            </Card>

            {lastRequest && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Request URL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/50 border p-3 overflow-x-auto">
                    <code className="text-sm font-mono break-all">{window.location.origin}{lastRequest.url}</code>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search" data-testid="tab-search-results">
                  Results {searchResult && `(${searchResult.resultcount})`}
                </TabsTrigger>
                <TabsTrigger value="response" data-testid="tab-response">
                  JSON Response
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-4">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{(error as Error).message}</AlertDescription>
                  </Alert>
                )}

                {isLoading && (
                  <Card>
                    <CardContent className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mb-4" />
                      <p>Searching HUDOC database...</p>
                    </CardContent>
                  </Card>
                )}

                {!isLoading && !searchResult && !error && (
                  <Card>
                    <CardContent className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Send className="h-8 w-8 mb-4 opacity-50" />
                      <p className="text-center">
                        Enter search parameters and click "Search" to query the HUDOC database.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {searchResult && !isLoading && (
                  <div className="space-y-4">
                    {searchResult.results.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mb-4 opacity-50" />
                          <p className="text-center">No cases found matching your criteria.</p>
                          <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={selectedCaseIds.size > 0 ? deselectAll : selectAllVisible}
                              data-testid="button-select-all"
                            >
                              {selectedCaseIds.size > 0 ? "Deselect All" : "Select All"}
                            </Button>
                            {selectedCaseIds.size > 0 && (
                              <Badge variant="secondary" data-testid="text-selected-count">
                                {selectedCaseIds.size} selected
                              </Badge>
                            )}
                          </div>
                          {selectedCaseIds.size > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  disabled={bulkDownloadMutation.isPending}
                                  data-testid="button-bulk-download"
                                >
                                  {bulkDownloadMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                  )}
                                  Download ({selectedCaseIds.size})
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleBulkDownload("json")} data-testid="menu-item-download-json">
                                  Download as JSON
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkDownload("csv")} data-testid="menu-item-download-csv">
                                  Download as CSV
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="space-y-3">
                            {searchResult.results.map((caseData) => (
                              <div key={caseData.itemid} className="flex items-start gap-3">
                                <Checkbox
                                  checked={selectedCaseIds.has(caseData.itemid)}
                                  onCheckedChange={() => toggleCaseSelection(caseData.itemid)}
                                  className="mt-3"
                                  data-testid={`checkbox-case-${caseData.itemid}`}
                                />
                                <div className="flex-1">
                                  <CaseCard
                                    caseData={caseData}
                                    onClick={() => handleCaseClick(caseData)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <Pagination
                          page={searchResult.page}
                          totalPages={searchResult.totalPages}
                          pageSize={searchResult.pageSize}
                          totalItems={searchResult.resultcount}
                          onPageChange={handlePageChange}
                          onPageSizeChange={handlePageSizeChange}
                        />
                      </>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="response" className="mt-4">
                {selectedCase ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h3 className="font-semibold">{selectedCase.docname}</h3>
                      {selectedCase.ecli && (
                        <a
                          href={`https://hudoc.echr.coe.int/eng?i=${selectedCase.itemid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          View on HUDOC
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <CodeBlock
                      code={JSON.stringify(selectedCase, null, 2)}
                      language="json"
                      className="max-h-[600px] overflow-auto"
                    />
                  </div>
                ) : searchResult ? (
                  <CodeBlock
                    code={JSON.stringify(searchResult, null, 2)}
                    language="json"
                    className="max-h-[600px] overflow-auto"
                  />
                ) : (
                  <Card>
                    <CardContent className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Send className="h-8 w-8 mb-4 opacity-50" />
                      <p className="text-center">
                        Execute a search to see the JSON response here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
