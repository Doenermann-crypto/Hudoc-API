import { Activity, CheckCircle, AlertTriangle, XCircle, Zap, Database, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ApiStatus } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ApiStatusCardProps {
  status?: ApiStatus;
  isLoading?: boolean;
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    label: "Operational",
    className: "text-green-600 dark:text-green-400",
    badgeClass: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  },
  degraded: {
    icon: AlertTriangle,
    label: "Degraded",
    className: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  down: {
    icon: XCircle,
    label: "Down",
    className: "text-red-600 dark:text-red-400",
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export function ApiStatusCard({ status, isLoading }: ApiStatusCardProps) {
  const config = status ? statusConfig[status.status] : statusConfig.operational;
  const StatusIcon = config.icon;

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card data-testid="api-status-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full bg-muted", config.className)}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">API Status</CardTitle>
              <CardDescription>
                HUDOC Connection
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={config.badgeClass}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      {status && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Uptime</span>
              </div>
              <p className="text-sm font-semibold">{formatUptime(status.uptime)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Database className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Cache Size</span>
              </div>
              <p className="text-sm font-semibold">{status.cacheStats.size} items</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Cache Hit Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={status.cacheStats.hitRate * 100} className="h-1.5 flex-1" />
                <span className="text-xs font-semibold">{(status.cacheStats.hitRate * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Rate Limit</span>
              </div>
              <p className="text-sm font-semibold">{status.rateLimitRemaining}/100</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
