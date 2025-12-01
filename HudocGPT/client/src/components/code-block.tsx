import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({ code, language = "json", showLineNumbers = false, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className={cn("relative group rounded-lg bg-muted/50 border", className)}>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-8 w-8"
          data-testid="button-copy-code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground uppercase">{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono">
        <code>
          {showLineNumbers ? (
            lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="text-muted-foreground select-none w-8 text-right pr-4">{i + 1}</span>
                <span>{line}</span>
              </div>
            ))
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
}

interface MultiLanguageCodeBlockProps {
  examples: {
    language: string;
    label: string;
    code: string;
  }[];
  className?: string;
}

export function MultiLanguageCodeBlock({ examples, className }: MultiLanguageCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(examples[0]?.language || "");

  const copyToClipboard = async () => {
    const activeExample = examples.find(e => e.language === activeTab);
    if (activeExample) {
      await navigator.clipboard.writeText(activeExample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("relative group rounded-lg bg-muted/50 border", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <TabsList className="h-8 bg-transparent p-0 gap-1">
            {examples.map((example) => (
              <TabsTrigger
                key={example.language}
                value={example.language}
                className="h-7 px-3 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                data-testid={`tab-${example.language}`}
              >
                {example.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            data-testid="button-copy-multi-code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        {examples.map((example) => (
          <TabsContent key={example.language} value={example.language} className="m-0">
            <pre className="p-4 overflow-x-auto text-sm font-mono">
              <code>{example.code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
