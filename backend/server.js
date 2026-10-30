
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const NVD_API_URL =
  "https://services.nvd.nist.gov/rest/json/cves/2.0";

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "SecuWeb API",
    message: "SecuWeb vulnerability search service",
    status: "running",
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/cves", async (req, res) => {
  try {
    const { cveId, vendor, severity } = req.query;

    if (!cveId && !vendor && !severity) {
      return res.status(400).json({
        error: "Provide a CVE ID, vendor, or severity to search.",
      });
    }

    if (
      cveId &&
      !/^CVE-\d{4}-\d{4,}$/i.test(String(cveId).trim())
    ) {
      return res.status(400).json({
        error: "Invalid CVE ID format. Example: CVE-2021-44228",
      });
    }

    const params = new URLSearchParams();

    if (cveId) {
      params.set("cveId", String(cveId).trim().toUpperCase());
    } else {
      if (vendor) {
        params.set("keywordSearch", String(vendor).trim());
      }

      if (severity) {
        const allowedSeverities = [
          "CRITICAL",
          "HIGH",
          "MEDIUM",
          "LOW",
        ];

        const normalizedSeverity = String(severity).toUpperCase();

        if (!allowedSeverities.includes(normalizedSeverity)) {
          return res.status(400).json({
            error: "Unsupported severity value.",
          });
        }

        params.set("cvssV3Severity", normalizedSeverity);
      }

      params.set("resultsPerPage", "20");
    }

    const headers = {};

    if (process.env.NVD_API_KEY) {
      headers.apiKey = process.env.NVD_API_KEY;
    }

    const response = await fetch(
      `${NVD_API_URL}?${params.toString()}`,
      {
        headers,
        signal: AbortSignal.timeout(20000),
      },
    );

    if (!response.ok) {
      console.error("NVD API returned status:", response.status);

      if (response.status === 429) {
        return res.status(429).json({
          error: "The NVD service is busy. Please try again shortly.",
        });
      }

      return res.status(502).json({
        error: "The NVD service could not complete the search.",
      });
    }

    const data = await response.json();

    return res.json({
      totalResults: data.totalResults ?? 0,
      vulnerabilities: data.vulnerabilities ?? [],
    });
  } catch (error) {
    console.error("Search error:", error.message);

    if (error.name === "TimeoutError") {
      return res.status(504).json({
        error: "The NVD request timed out. Please try again.",
      });
    }

    return res.status(500).json({
      error: "An unexpected error occurred while searching.",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SecuWeb API listening on port ${PORT}`);
});
