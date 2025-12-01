import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MultiLanguageCodeBlock } from "@/components/code-block";
import type { ApiEndpoint } from "@shared/schema";
import { cn } from "@/lib/utils";

interface EndpointCardProps {
  endpoint: ApiEndpoint;
  baseUrl: string;
}

const methodColors = {
  GET: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  PUT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export function EndpointCard({ endpoint, baseUrl }: EndpointCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const fullUrl = `${baseUrl}${endpoint.path}`;

  const generateCodeExamples = () => {
    const queryParams = endpoint.parameters
      .filter(p => !p.required)
      .slice(0, 2)
      .map(p => `${p.name}=${p.example || "value"}`)
      .join("&");
    
    const urlWithParams = queryParams ? `${fullUrl}?${queryParams}` : fullUrl;

    return [
      {
        language: "curl",
        label: "cURL",
        code: `curl -X ${endpoint.method} "${urlWithParams}" \\
  -H "Content-Type: application/json"`,
      },
      {
        language: "javascript",
        label: "JavaScript",
        code: `const response = await fetch("${urlWithParams}", {
  method: "${endpoint.method}",
  headers: {
    "Content-Type": "application/json"
  }
});

const data = await response.json();
console.log(data);`,
      },
      {
        language: "python",
        label: "Python",
        code: `import requests

response = requests.${endpoint.method.toLowerCase()}(
    "${urlWithParams}",
    headers={"Content-Type": "application/json"}
)

data = response.json()
print(data)`,
      },
    ];
  };

  return (
    <Card className="overflow-hidden" data-testid={`endpoint-card-${endpoint.path.replace(/\//g, "-")}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="flex flex-row items-center gap-4 py-4 hover-elevate cursor-pointer">
            <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-xs font-semibold px-2 py-0.5 shrink-0",
                  methodColors[endpoint.method]
                )}
              >
                {endpoint.method}
              </Badge>
              <code className="font-mono text-sm font-medium truncate">{endpoint.path}</code>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">{endpoint.description}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            <div>
              <CardDescription className="text-sm mb-4 sm:hidden">
                {endpoint.description}
              </CardDescription>
            </div>

            {endpoint.parameters.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Parameters</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Required</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {endpoint.parameters.map((param) => (
                        <TableRow key={param.name}>
                          <TableCell className="font-mono text-sm">{param.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {param.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {param.required ? (
                              <Badge variant="default" className="text-xs">Required</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Optional</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {param.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-3">Example Request</h4>
              <MultiLanguageCodeBlock examples={generateCodeExamples()} />
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Example Response</h4>
              <div className="rounded-lg bg-muted/50 border p-4 overflow-x-auto">
                <pre className="text-sm font-mono">
                  <code>{JSON.stringify(endpoint.responseExample, null, 2)}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
