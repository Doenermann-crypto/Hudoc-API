import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { searchCases, getCaseById, getCacheStats, getUptime, articleDescriptions, countryNames, getBulkCases, convertToCsv, advancedSearchCases } from "./hudoc";
import { searchParamsSchema, bulkDownloadSchema, advancedSearchParamsSchema } from "@shared/schema";
import { z } from "zod";

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Rate limit exceeded",
    message: "Please wait before making more requests",
    code: "RATE_LIMITED",
    retryAfter: 60,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/api", limiter);

  app.get("/api/status", async (_req, res) => {
    try {
      const cacheStats = getCacheStats();
      const uptime = getUptime();
      
      res.json({
        status: "operational",
        uptime,
        lastCheck: new Date().toISOString(),
        cacheStats,
        rateLimitRemaining: 100,
      });
    } catch (error) {
      res.status(500).json({
        status: "degraded",
        uptime: getUptime(),
        lastCheck: new Date().toISOString(),
        cacheStats: getCacheStats(),
        rateLimitRemaining: 100,
      });
    }
  });

  app.get("/api/cases/search", async (req, res) => {
    try {
      const rawParams = {
        query: req.query.query as string | undefined,
        applicationNumber: req.query.applicationNumber as string | undefined,
        caseTitle: req.query.caseTitle as string | undefined,
        respondentState: req.query.respondentState as string | undefined,
        article: req.query.article as string | undefined,
        importance: req.query.importance as string | undefined,
        documentType: req.query.documentType as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
        violation: req.query.violation === "true" ? true : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
      };

      const validatedParams = searchParamsSchema.parse(rawParams);
      const results = await searchCases(validatedParams);
      
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid parameter",
          message: error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "),
          code: "INVALID_PARAM",
        });
      }
      
      res.status(500).json({
        error: "Search failed",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "SEARCH_ERROR",
      });
    }
  });

  app.get("/api/cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          error: "Invalid parameter",
          message: "Case ID is required",
          code: "INVALID_PARAM",
        });
      }

      const caseDetail = await getCaseById(id);
      
      if (!caseDetail) {
        return res.status(404).json({
          error: "Case not found",
          message: `No case found with ID: ${id}`,
          code: "NOT_FOUND",
        });
      }
      
      res.json(caseDetail);
    } catch (error) {
      console.error("Case fetch error:", error);
      res.status(500).json({
        error: "Fetch failed",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "FETCH_ERROR",
      });
    }
  });

  app.get("/api/articles", (_req, res) => {
    const articles = Object.entries(articleDescriptions).map(([code, info]) => ({
      code,
      name: info.name,
      description: info.description,
    }));
    
    res.json({ articles });
  });

  app.get("/api/countries", (_req, res) => {
    const countries = Object.entries(countryNames).map(([code, name]) => ({
      code,
      name,
    }));
    
    res.json({ countries });
  });

  app.post("/api/cases/bulk", async (req, res) => {
    try {
      const params = bulkDownloadSchema.parse(req.body);
      
      const { cases, errors } = await getBulkCases(params.caseIds, params.includeFullText);
      
      const result = {
        cases,
        totalRequested: params.caseIds.length,
        totalRetrieved: cases.length,
        errors,
      };
      
      if (params.format === "csv") {
        const csv = convertToCsv(cases);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=hudoc-cases.csv");
        return res.send(csv);
      }
      
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=hudoc-cases.json");
      res.json(result);
    } catch (error) {
      console.error("Bulk download error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request",
          message: error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "),
          code: "INVALID_REQUEST",
        });
      }
      
      res.status(500).json({
        error: "Bulk download failed",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "BULK_ERROR",
      });
    }
  });

  app.get("/api/cases/advanced", async (req, res) => {
    try {
      const rawParams = {
        query: req.query.query as string | undefined,
        applicationNumber: req.query.applicationNumber as string | undefined,
        caseTitle: req.query.caseTitle as string | undefined,
        respondentStates: req.query.respondentStates 
          ? (Array.isArray(req.query.respondentStates) 
              ? req.query.respondentStates as string[] 
              : [req.query.respondentStates as string])
          : undefined,
        articles: req.query.articles 
          ? (Array.isArray(req.query.articles) 
              ? req.query.articles as string[] 
              : [req.query.articles as string])
          : undefined,
        importance: req.query.importance as string | undefined,
        documentType: req.query.documentType as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
        violation: req.query.violation === "true" ? true : undefined,
        language: req.query.language as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
      };

      const validatedParams = advancedSearchParamsSchema.parse(rawParams);
      const results = await advancedSearchCases(validatedParams);
      
      res.json(results);
    } catch (error) {
      console.error("Advanced search error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid parameter",
          message: error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "),
          code: "INVALID_PARAM",
        });
      }
      
      res.status(500).json({
        error: "Search failed",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "SEARCH_ERROR",
      });
    }
  });

  return httpServer;
}
