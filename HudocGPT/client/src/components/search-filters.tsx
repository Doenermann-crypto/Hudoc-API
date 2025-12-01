import { Search, X, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import type { SearchParams } from "@shared/schema";
import { echrArticles, countries, importanceLevels, documentTypes } from "@shared/schema";

interface SearchFiltersProps {
  onSearch: (params: Partial<SearchParams>) => void;
  isLoading?: boolean;
}

const countryNames: Record<string, string> = {
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

const importanceLabels: Record<string, string> = {
  "1": "Key Case",
  "2": "High Importance",
  "3": "Medium Importance",
  "4": "Low Importance",
};

const documentTypeLabels: Record<string, string> = {
  JUDGMENTS: "Judgments",
  DECISIONS: "Decisions",
  COMMUNICATEDCASES: "Communicated Cases",
  ADVISORYOPINIONS: "Advisory Opinions",
  REPORTS: "Reports",
  RESOLUTIONS: "Resolutions",
};

export function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState("");
  const [applicationNumber, setApplicationNumber] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [respondentState, setRespondentState] = useState<string>("");
  const [article, setArticle] = useState<string>("");
  const [importance, setImportance] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [violationOnly, setViolationOnly] = useState(false);

  const activeFiltersCount = [
    respondentState, article, importance, documentType, language, yearFrom, yearTo, dateFrom, dateTo, violationOnly
  ].filter(Boolean).length;

  const handleSearch = () => {
    const params: Partial<SearchParams> = {};
    if (query) params.query = query;
    if (applicationNumber) params.applicationNumber = applicationNumber;
    if (caseTitle) params.caseTitle = caseTitle;
    if (respondentState) params.respondentState = respondentState as typeof countries[number];
    if (article) params.article = article as typeof echrArticles[number];
    if (importance) params.importance = importance as typeof importanceLevels[number];
    if (documentType) params.documentType = documentType as typeof documentTypes[number];
    if (language) (params as any).language = language;
    
    // Handle year range conversion to dates
    if (yearFrom) {
      params.dateFrom = `${yearFrom}-01-01`;
    } else if (dateFrom) {
      params.dateFrom = dateFrom;
    }
    
    if (yearTo) {
      params.dateTo = `${yearTo}-12-31`;
    } else if (dateTo) {
      params.dateTo = dateTo;
    }
    
    if (violationOnly) params.violation = true;
    onSearch(params);
  };

  const handleClear = () => {
    setQuery("");
    setApplicationNumber("");
    setCaseTitle("");
    setRespondentState("");
    setArticle("");
    setImportance("");
    setDocumentType("");
    setLanguage("");
    setYearFrom("");
    setYearTo("");
    setDateFrom("");
    setDateTo("");
    setViolationOnly(false);
    onSearch({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4" data-testid="search-filters">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cases by keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
            data-testid="input-search-query"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading} data-testid="button-search">
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-toggle-filters">
              <Filter className="h-4 w-4" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5 text-muted-foreground" data-testid="button-clear-filters">
              <X className="h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>

        <CollapsibleContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="applicationNumber">Application Number</Label>
              <Input
                id="applicationNumber"
                placeholder="e.g., 12345/67"
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                data-testid="input-application-number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseTitle">Case Title</Label>
              <Input
                id="caseTitle"
                placeholder="e.g., Smith v. Country"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                data-testid="input-case-title"
              />
            </div>

            <div className="space-y-2">
              <Label>Respondent State</Label>
              <Select value={respondentState} onValueChange={setRespondentState}>
                <SelectTrigger data-testid="select-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((code) => (
                    <SelectItem key={code} value={code}>
                      {countryNames[code] || code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Article</Label>
              <Select value={article} onValueChange={setArticle}>
                <SelectTrigger data-testid="select-article">
                  <SelectValue placeholder="Select article" />
                </SelectTrigger>
                <SelectContent>
                  {echrArticles.map((art) => (
                    <SelectItem key={art} value={art}>
                      Article {art}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Importance</Label>
              <Select value={importance} onValueChange={setImportance}>
                <SelectTrigger data-testid="select-importance">
                  <SelectValue placeholder="Select importance" />
                </SelectTrigger>
                <SelectContent>
                  {importanceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {importanceLabels[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger data-testid="select-document-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {documentTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENG">English</SelectItem>
                  <SelectItem value="FRA">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearFrom">Year From</Label>
              <Input
                id="yearFrom"
                type="number"
                placeholder="e.g., 2000"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                min="1950"
                max={new Date().getFullYear().toString()}
                data-testid="input-year-from"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearTo">Year To</Label>
              <Input
                id="yearTo"
                type="number"
                placeholder="e.g., 2024"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                min="1950"
                max={new Date().getFullYear().toString()}
                data-testid="input-year-to"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From (Optional)</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={!!yearFrom}
                data-testid="input-date-from"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To (Optional)</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={!!yearTo}
                data-testid="input-date-to"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="violationOnly" className="block">Violation Cases Only</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch
                  id="violationOnly"
                  checked={violationOnly}
                  onCheckedChange={setViolationOnly}
                  data-testid="switch-violation-only"
                />
                <span className="text-sm text-muted-foreground">
                  {violationOnly ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
