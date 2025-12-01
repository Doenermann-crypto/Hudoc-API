import { Calendar, Flag, FileText, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HudocCase } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CaseCardProps {
  caseData: HudocCase;
  onClick?: () => void;
}

const importanceLabels: Record<string, { label: string; className: string }> = {
  "1": { label: "Key Case", className: "bg-primary/10 text-primary border-primary/20" },
  "2": { label: "High", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  "3": { label: "Medium", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  "4": { label: "Low", className: "bg-muted text-muted-foreground" },
};

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

export function CaseCard({ caseData, onClick }: CaseCardProps) {
  const importance = importanceLabels[caseData.importance] || importanceLabels["4"];
  const countryName = countryNames[caseData.respondent] || caseData.respondent;
  
  const hasViolation = caseData.conclusion?.toLowerCase().includes("violation");
  const hasNoViolation = caseData.conclusion?.toLowerCase().includes("no violation");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card 
      className={cn(
        "transition-all cursor-pointer hover-elevate",
        onClick && "active-elevate-2"
      )}
      onClick={onClick}
      data-testid={`case-card-${caseData.itemid}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
              {caseData.docname}
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              App. No. {caseData.appno}
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn("shrink-0", importance.className)}>
            {importance.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5" />
            <span>{countryName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(caseData.judgmentdate || caseData.kpdate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="capitalize">{caseData.doctype?.toLowerCase() || "Judgment"}</span>
          </div>
        </div>

        {caseData.article && caseData.article.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {caseData.article.slice(0, 5).map((art) => (
              <Badge key={art} variant="secondary" className="text-xs font-mono">
                Art. {art}
              </Badge>
            ))}
            {caseData.article.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{caseData.article.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {caseData.conclusion && (
          <div className="mt-3 flex items-center gap-2">
            <Scale className="h-3.5 w-3.5 text-muted-foreground" />
            {hasViolation && !hasNoViolation && (
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                Violation
              </Badge>
            )}
            {hasNoViolation && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                No Violation
              </Badge>
            )}
            {!hasViolation && !hasNoViolation && (
              <span className="text-xs text-muted-foreground truncate">{caseData.conclusion}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
