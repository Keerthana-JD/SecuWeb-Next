
import { useMemo, useState, type FormEvent } from "react";
import "./App.css";

type Vulnerability = {
  id: string;
  description: string;
  published: string;
  severity: string;
  score: string;
  url: string;
};

type ApiRecord = Record<string, any>;

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

function getVulnerability(record: ApiRecord): Vulnerability {
  const cve = record.cve ?? record;
  const metrics = cve.metrics ?? {};
  const metric =
    metrics.cvssMetricV40?.[0] ??
    metrics.cvssMetricV31?.[0] ??
    metrics.cvssMetricV30?.[0] ??
    metrics.cvssMetricV2?.[0];

  const cvss = metric?.cvssData ?? {};
  const englishDescription =
    cve.descriptions?.find(
      (description: { lang: string; value: string }) =>
        description.lang === "en",
    )?.value;

  const id = cve.id ?? record.id ?? "Unknown CVE";

  return {
    id,
    description:
      englishDescription ??
      record.description ??
      "No English description is available.",
    published: cve.published
      ? new Date(cve.published).toLocaleDateString()
      : record.published ?? "—",
    severity: String(
      cvss.baseSeverity ??
        metric?.baseSeverity ??
        record.severity ??
        "UNKNOWN",
    ).toUpperCase(),
    score:
      cvss.baseScore !== undefined
        ? String(cvss.baseScore)
        : record.score !== undefined
          ? String(record.score)
          : "—",
    url:
      record.url ??
      `https://nvd.nist.gov/vuln/detail/${id}`,
  };
}

function App() {
  const [cveId, setCveId] = useState("");
  const [vendor, setVendor] = useState("");
  const [severity, setSeverity] = useState("");
  const [results, setResults] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const severityCounts = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

    for (const result of results) {
      if (result.severity in counts) {
        counts[result.severity as keyof typeof counts] += 1;
      }
    }

    return counts;
  }, [results]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cveId.trim() && !vendor.trim() && !severity) {
      setError("Enter a CVE ID, vendor, or choose a severity to search.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setSearched(true);

    try {
      const params = new URLSearchParams();

      if (cveId.trim()) params.set("cveId", cveId.trim());
      if (vendor.trim()) params.set("vendor", vendor.trim());
      if (severity) params.set("severity", severity);

      const response = await fetch(
        `${API_BASE_URL}/api/cves?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(
          `The vulnerability service returned HTTP ${response.status}.`,
        );
      }

      const data = await response.json();
      const records = Array.isArray(data)
        ? data
        : Array.isArray(data.vulnerabilities)
          ? data.vulnerabilities
          : Array.isArray(data.results)
            ? data.results
            : [];

      setResults(records.map(getVulnerability));
    } catch {
      setError(
        "We couldn't reach the vulnerability service. The backend may not be running yet, or its public URL may need to be configured.",
      );
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setCveId("");
    setVendor("");
    setSeverity("");
    setResults([]);
    setError("");
    setSearched(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="SecuWeb home">
          <span className="brand-mark">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path
                d="M20 4 33 9v10c0 8-5.5 13.5-13 17C12.5 32.5 7 27 7 19V9l13-5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              />
              <path
                d="m14 20 4 4 8-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="brand-name">
            Secu<span>Web</span>
            <small>VULNERABILITY INTELLIGENCE</small>
          </span>
        </a>

        <div className="header-right">
          <span className="header-label">
            <span className="live-dot" />
            Security research workspace
          </span>
          <a
            className="header-link"
            href="https://nvd.nist.gov/"
            target="_blank"
            rel="noreferrer"
          >
            NVD database <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main className="workspace">
        <div className="breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-separator">/</span>
          <strong>Vulnerability search</strong>
        </div>

        <section className="intro">
          <div className="intro-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              THREAT & VULNERABILITY INTELLIGENCE
            </div>
            <h1>
              Vulnerability
              <br className="mobile-break" />{" "}
              <span>Explorer.</span>
            </h1>
            <p>
              Investigate CVEs, review severity scores, and access trusted
              vulnerability intelligence from the National Vulnerability
              Database.
            </p>
          </div>

          <div className="intro-art" aria-hidden="true">
            <div className="art-ring ring-one" />
            <div className="art-ring ring-two" />
            <div className="art-center">
              <svg viewBox="0 0 64 64">
                <path
                  d="M32 6 52 14v15c0 13-8.5 22-20 29C20.5 51 12 42 12 29V14L32 6Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
                <path
                  d="M24 32h16M32 24v16"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="art-spark spark-one" />
            <span className="art-spark spark-two" />
            <span className="art-spark spark-three" />
          </div>
        </section>

        <section className="search-panel">
          <div className="section-heading">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </div>
            <div>
              <h2>Search vulnerabilities</h2>
              <p>Refine your search using one or more criteria.</p>
            </div>
            <span className="optional-tag">ADVANCED SEARCH</span>
          </div>

          <form onSubmit={handleSearch}>
            <div className="search-fields">
              <label className="field">
                <span className="field-label">
                  CVE identifier <span className="field-hint">01</span>
                </span>
                <span className="input-wrap">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 4h10M7 8h10M7 12h6M5 3h14v18H5z" />
                  </svg>
                  <input
                    value={cveId}
                    onChange={(event) => setCveId(event.target.value)}
                    placeholder="CVE-2021-44228"
                    aria-label="CVE identifier"
                  />
                </span>
                <span className="field-description">
                  Search for a specific vulnerability
                </span>
              </label>

              <label className="field">
                <span className="field-label">
                  Vendor / OEM <span className="field-hint">02</span>
                </span>
                <span className="input-wrap">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h2m2 0h2M9 14h2m2 0h2M10 21v-4h4v4" />
                  </svg>
                  <input
                    value={vendor}
                    onChange={(event) => setVendor(event.target.value)}
                    placeholder="e.g. Microsoft, Cisco"
                    aria-label="Vendor or OEM"
                  />
                </span>
                <span className="field-description">
                  Find vulnerabilities by vendor
                </span>
              </label>

              <label className="field">
                <span className="field-label">
                  Severity level <span className="field-hint">03</span>
                </span>
                <span className="input-wrap select-wrap">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3 22 20H2L12 3Z" />
                    <path d="M12 9v5m0 3h.01" />
                  </svg>
                  <select
                    value={severity}
                    onChange={(event) => setSeverity(event.target.value)}
                    aria-label="Severity level"
                  >
                    <option value="">All severity levels</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </span>
                <span className="field-description">
                  Prioritize vulnerabilities by risk
                </span>
              </label>
            </div>

            <div className="search-footer">
              <p>
                <span className="secure-lock" aria-hidden="true">◇</span>
                Data sourced from the NIST National Vulnerability Database
              </p>
              <div className="search-actions">
                <button
                  type="button"
                  className="clear-button"
                  onClick={clearSearch}
                  disabled={loading}
                >
                  Clear filters
                </button>
                <button
                  type="submit"
                  className="search-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Searching
                    </>
                  ) : (
                    <>
                      Search database
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="results-section">
          <div className="results-title-row">
            <div>
              <div className="results-kicker">INTELLIGENCE OVERVIEW</div>
              <h2>Search results</h2>
              <p>
                {loading
                  ? "Retrieving matching vulnerability records…"
                  : searched
                    ? `${results.length} matching record${results.length === 1 ? "" : "s"} returned`
                    : "Your vulnerability findings will appear here."}
              </p>
            </div>
            <div className="result-total">
              <span>RESULTS</span>
              <strong>{results.length}</strong>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card stat-total">
              <span className="stat-symbol">Σ</span>
              <span className="stat-label">Total results</span>
              <strong>{results.length}</strong>
              <span className="stat-footnote">Current search</span>
            </div>
            <div className="stat-card stat-critical">
              <span className="stat-symbol">!</span>
              <span className="stat-label">Critical</span>
              <strong>{severityCounts.CRITICAL}</strong>
              <span className="stat-footnote">Highest severity</span>
            </div>
            <div className="stat-card stat-high">
              <span className="stat-symbol">↑</span>
              <span className="stat-label">High</span>
              <strong>{severityCounts.HIGH}</strong>
              <span className="stat-footnote">High severity</span>
            </div>
            <div className="stat-card stat-medium">
              <span className="stat-symbol">◇</span>
              <span className="stat-label">Medium / Low</span>
              <strong>
                {severityCounts.MEDIUM + severityCounts.LOW}
              </strong>
              <span className="stat-footnote">Lower severity</span>
            </div>
          </div>

          {error && (
            <div className="notice error-notice" role="alert">
              <span className="notice-icon">!</span>
              <div>
                <strong>Search service unavailable</strong>
                <p>{error}</p>
                <p>
                  The frontend needs a running Express backend. We will
                  configure the correct service URL before public deployment.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="table-state">
              <span className="spinner spinner-large" />
              <strong>Searching vulnerability records</strong>
              <p>Please wait while we retrieve the matching data.</p>
            </div>
          )}

          {!loading && !error && !searched && (
            <div className="table-state initial-state">
              <div className="state-illustration">
                <svg viewBox="0 0 56 56" aria-hidden="true">
                  <circle cx="24" cy="24" r="14" />
                  <path d="m34 34 12 12M18 24h12m-6-6v12" />
                </svg>
              </div>
              <strong>Ready to investigate</strong>
              <p>
                Enter a CVE identifier, vendor, or severity above to begin
                exploring vulnerabilities.
              </p>
            </div>
          )}

          {!loading && !error && searched && results.length === 0 && (
            <div className="table-state">
              <div className="state-illustration">
                <svg viewBox="0 0 56 56" aria-hidden="true">
                  <circle cx="24" cy="24" r="14" />
                  <path d="m34 34 12 12M18 24h12" />
                </svg>
              </div>
              <strong>No matching vulnerabilities</strong>
              <p>
                Try a different CVE ID, vendor name, or severity level.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="table-container">
              <div className="table-topline">
                <span>VULNERABILITY RECORDS</span>
                <span>{results.length} RECORDS</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>VULNERABILITY</th>
                      <th>SEVERITY</th>
                      <th>CVSS</th>
                      <th>PUBLISHED</th>
                      <th>DETAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <a
                            className="table-cve"
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {item.id}
                          </a>
                          <p className="table-description">
                            {item.description}
                          </p>
                        </td>
                        <td>
                          <span
                            className={`severity severity-${item.severity.toLowerCase()}`}
                          >
                            <span className="severity-dot" />
                            {item.severity}
                          </span>
                        </td>
                        <td>
                          <span className="cvss-score">{item.score}</span>
                          <span className="cvss-caption">CVSS score</span>
                        </td>
                        <td className="published-date">{item.published}</td>
                        <td>
                          <a
                            className="detail-link"
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`View ${item.id} on NVD`}
                          >
                            View <span aria-hidden="true">↗</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-bottomline">
                <span>Source: National Vulnerability Database (NVD)</span>
                <span>CVSS = Common Vulnerability Scoring System</span>
              </div>
            </div>
          )}
        </section>

        <footer className="footer">
          <a className="footer-brand" href="#">
            Secu<span>Web</span>
          </a>
          <p>Cybersecurity intelligence for a safer digital world.</p>
          <a
            href="https://nvd.nist.gov/"
            target="_blank"
            rel="noreferrer"
          >
            Official NVD resource ↗
          </a>
        </footer>
      </main>
    </div>
  );
}

export default App;
