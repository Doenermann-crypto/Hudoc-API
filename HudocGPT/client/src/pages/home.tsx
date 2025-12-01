import { Link } from "wouter";
import { ArrowRight, BookOpen, Code, Search, Zap, Shield, Globe, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { ApiStatusCard } from "@/components/api-status";
import { useQuery } from "@tanstack/react-query";
import type { ApiStatus } from "@shared/schema";

const features = [
  {
    icon: Search,
    title: "Powerful Search",
    description: "Search ECHR cases by keywords, application numbers, case titles, and full-text content with advanced filtering capabilities."
  },
  {
    icon: Globe,
    title: "Multi-Country",
    description: "Filter cases by any of the 47 Council of Europe member states. Access judgments and decisions from all respondent states."
  },
  {
    icon: Database,
    title: "Comprehensive Data",
    description: "Access judgments, decisions, communicated cases, advisory opinions, and legal summaries from the complete HUDOC database."
  },
  {
    icon: Zap,
    title: "Optimized for AI",
    description: "Structured JSON responses designed for LLM consumption. Clean formatting and extracted text perfect for GPT integration."
  },
  {
    icon: Shield,
    title: "Rate Limiting",
    description: "Built-in rate limiting protects both the API and HUDOC servers. Intelligent caching reduces redundant requests."
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "RESTful endpoints with clear documentation. Code examples in cURL, JavaScript, and Python for quick integration."
  }
];

const quickStartCode = `// Search for privacy cases against the UK
const response = await fetch(
  "/api/cases/search?query=privacy&respondentState=GBR&article=8"
);
const { results, totalPages } = await response.json();

// Get full case details
const caseDetail = await fetch(\`/api/cases/\${results[0].itemid}\`);
const fullCase = await caseDetail.json();`;

export default function Home() {
  const { data: status, isLoading: statusLoading } = useQuery<ApiStatus>({
    queryKey: ["/api/status"],
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container max-w-6xl mx-auto px-4 relative">
          <div className="flex flex-col items-center text-center space-y-6">
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium" data-testid="badge-version">
              v1.0 Beta
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl" data-testid="text-hero-title">
              HUDOC API for{" "}
              <span className="text-primary">ECHR Case Law</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl" data-testid="text-hero-description">
              A modern REST API wrapper for the European Court of Human Rights case law database. 
              Search, filter, and retrieve cases programmatically for your legal research and AI applications.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/docs">
                <Button size="lg" className="gap-2" data-testid="button-get-started">
                  <BookOpen className="h-4 w-4" />
                  Get Started
                </Button>
              </Link>
              <Link href="/explorer">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-try-api">
                  Try the API
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-t bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <ApiStatusCard status={status} isLoading={statusLoading} />
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-features-title">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for legal tech applications and AI-powered research tools.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="hover-elevate" data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/30 border-t">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-quickstart-title">
              Quick Start
            </h2>
            <p className="text-lg text-muted-foreground">
              Start searching ECHR cases in minutes with our simple API.
            </p>
          </div>
          <CodeBlock 
            code={quickStartCode} 
            language="javascript"
            showLineNumbers
          />
          <div className="text-center mt-8">
            <Link href="/docs">
              <Button variant="outline" className="gap-2" data-testid="button-view-docs">
                <BookOpen className="h-4 w-4" />
                View Full Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Available Endpoints
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              RESTful endpoints designed for clarity and ease of use.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="hover-elevate" data-testid="card-endpoint-search">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-xs">
                    GET
                  </Badge>
                  <code className="font-mono text-sm">/api/cases/search</code>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Search cases with filters for country, article, importance, date range, and full-text queries.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover-elevate" data-testid="card-endpoint-case-detail">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-xs">
                    GET
                  </Badge>
                  <code className="font-mono text-sm">/api/cases/:id</code>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Retrieve full case details including judgment text, metadata, and extracted content.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover-elevate" data-testid="card-endpoint-articles">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-xs">
                    GET
                  </Badge>
                  <code className="font-mono text-sm">/api/articles</code>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  List all ECHR articles with descriptions and case count statistics.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover-elevate" data-testid="card-endpoint-countries">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-xs">
                    GET
                  </Badge>
                  <code className="font-mono text-sm">/api/countries</code>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  List all Council of Europe member states with their codes and case statistics.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-primary/5 border-t">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore our interactive API explorer to test endpoints, or dive into the documentation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/explorer">
              <Button size="lg" className="gap-2" data-testid="button-cta-explorer">
                <Code className="h-4 w-4" />
                Try API Explorer
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-cta-docs">
                <BookOpen className="h-4 w-4" />
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
