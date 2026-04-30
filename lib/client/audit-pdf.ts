import type {
  AuditConfigSnapshot,
  AuditResult,
} from "@/components/audit/mock-audit";
import {
  executionModeExplanation,
  getAuditProviderLabel,
  getAuditRouteLabel,
  getExecutionModeLabel,
  severityMethodologyEntries,
  severityMethodologyTitle,
} from "@/components/audit/mock-audit";
import type { jsPDF as JsPdfDocument } from "jspdf";
import type { UserOptions } from "jspdf-autotable";

type AutoTableFn = typeof import("jspdf-autotable").autoTable;
type AutoTableDoc = JsPdfDocument & {
  lastAutoTable?: {
    finalY?: number;
  };
};
type PdfContext = {
  config: AuditConfigSnapshot;
  result: AuditResult;
};
type PdfColor = [number, number, number];

const pageMarginX = 18;
const pageBottomMargin = 18;
const coverHeaderHeight = 40;
const continuationHeaderHeight = 18;
const colors = {
  navy: [4, 12, 24] as PdfColor,
  ink: [15, 23, 42] as PdfColor,
  muted: [71, 85, 105] as PdfColor,
  accent: [14, 165, 233] as PdfColor,
  accentSoft: [224, 242, 254] as PdfColor,
  border: [203, 213, 225] as PdfColor,
  surface: [241, 245, 249] as PdfColor,
  white: [255, 255, 255] as PdfColor,
  rose: [225, 29, 72] as PdfColor,
  emerald: [5, 150, 105] as PdfColor,
  amber: [217, 119, 6] as PdfColor,
} as const;

export async function downloadAuditPdfReport({
  config,
  result,
}: PdfContext) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    compress: true,
  });

  doc.setProperties({
    title: `Sentinel Veritas Vulnerability Report ${result.sessionId}`,
    subject: "AI security vulnerability assessment report",
    author: "Sentinel Veritas",
    creator: "Sentinel Veritas",
    keywords:
      "Sentinel Veritas, AI security, vulnerability report, multimodal audit",
  });

  const context = { config, result };
  let y = drawCoverHeader(doc, context);

  y = addSectionHeading(
    doc,
    context,
    y,
    "Executive Summary",
    "Headline metrics, risk narrative, and next-step priorities",
  );
  y = drawExecutiveSummary(doc, context, y);
  y = addExecutiveNarrative(doc, context, y);

  y = addSectionHeading(
    doc,
    context,
    y,
    "Risk Overview",
    "Severity posture and category-level distribution",
  );
  y = addTopRiskCategoryRow(doc, context, y);
  y = addCategoryBreakdownTable(doc, autoTable, context, y);

  y = addSectionHeading(
    doc,
    context,
    y,
    "Findings",
    "All executed tests with outcome, severity, and response excerpt",
  );
  y = addFindingsSummaryTable(doc, autoTable, context, y);

  y = addSectionHeading(
    doc,
    context,
    y,
    "Evidence",
    "Representative traces from the strongest audit signals",
  );
  y = addEvidenceTable(doc, autoTable, context, y);

  y = addSectionHeading(
    doc,
    context,
    y,
    "Recommendations",
    "Highest-impact control changes for the observed findings",
  );
  y = addBulletList(doc, context, y, context.result.remediationRecommendations);

  y = addSectionHeading(
    doc,
    context,
    y,
    "Session Context",
    "Execution metadata and configuration snapshot",
  );
  y = addOverviewTable(doc, autoTable, context, y);

  addSecurityNote(doc, context, y);
  addDocumentChrome(doc, context);

  doc.save(`${result.sessionId.toLowerCase()}-report.pdf`);
}

function drawCoverHeader(doc: JsPdfDocument, context: PdfContext) {
  const pageWidth = doc.internal.pageSize.getWidth();

  setFillColor(doc, colors.navy);
  doc.rect(0, 0, pageWidth, coverHeaderHeight, "F");

  setFillColor(doc, colors.accent);
  doc.rect(0, coverHeaderHeight - 3, pageWidth, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setTextColor(doc, colors.accentSoft);
  doc.text("SENTINEL VERITAS", pageMarginX, 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  setTextColor(doc, colors.white);
  doc.text("AI Vulnerability Report", pageMarginX, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setTextColor(doc, colors.accentSoft);
  doc.text(
    `Session ${context.result.sessionId}  ·  ${context.result.completedAt}`,
    pageMarginX,
    27.5,
  );

  doc.setFontSize(8);
  setTextColor(doc, [180, 210, 230] as PdfColor);
  doc.text(
    `${getAuditProviderLabel(context.result.provider)}  ·  ${context.result.modelUsed}  ·  ${industryLabel(context.config.industry)}`,
    pageMarginX,
    33,
  );

  const modeLabel = getExecutionModeLabel(context.result.mode);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  const modePillWidth = Math.max(52, doc.getTextWidth(modeLabel.toUpperCase()) + 12);

  drawModePill(
    doc,
    pageWidth - pageMarginX - modePillWidth,
    8,
    modePillWidth,
    10,
    modeLabel,
  );

  return coverHeaderHeight + 8;
}

function drawExecutiveSummary(
  doc: JsPdfDocument,
  context: PdfContext,
  startY: number,
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - pageMarginX * 2;
  const gap = 4;
  const largeCardWidth = (contentWidth - gap) / 2;
  const smallCardWidth = (contentWidth - gap * 2) / 3;

  drawMetricCard(
    doc,
    pageMarginX,
    startY,
    largeCardWidth,
    22,
    "Vulnerability Index",
    String(context.result.vulnerabilityIndex),
    colors.accent,
  );
  drawMetricCard(
    doc,
    pageMarginX + largeCardWidth + gap,
    startY,
    largeCardWidth,
    22,
    "Overall Severity",
    context.result.overallSeverity,
    severityColor(context.result.overallSeverity),
  );

  const smallCardY = startY + 26;
  drawMetricCard(
    doc,
    pageMarginX,
    smallCardY,
    smallCardWidth,
    18,
    "Tests Executed",
    String(context.result.testsExecuted),
    colors.ink,
  );
  drawMetricCard(
    doc,
    pageMarginX + smallCardWidth + gap,
    smallCardY,
    smallCardWidth,
    18,
    "Passed Tests",
    String(context.result.passedTests),
    colors.emerald,
  );
  drawMetricCard(
    doc,
    pageMarginX + (smallCardWidth + gap) * 2,
    smallCardY,
    smallCardWidth,
    18,
    "Failed Tests",
    String(context.result.failedTests),
    colors.rose,
  );

  return smallCardY + 24;
}

function drawMetricCard(
  doc: JsPdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  accentColor: PdfColor,
) {
  setFillColor(doc, colors.surface);
  setDrawColor(doc, colors.border);
  doc.roundedRect(x, y, width, height, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setTextColor(doc, colors.muted);
  doc.text(label.toUpperCase(), x + 4, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(height >= 22 ? 18 : 14);
  setTextColor(doc, accentColor);
  doc.text(value, x + 4, y + (height >= 22 ? 15 : 13));
}

function addSectionHeading(
  doc: JsPdfDocument,
  context: PdfContext,
  startY: number,
  title: string,
  subtitle: string,
) {
  const y = ensurePageSpace(doc, context, startY, 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setTextColor(doc, colors.ink);
  doc.text(title, pageMarginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setTextColor(doc, colors.muted);
  doc.text(subtitle, pageMarginX, y + 5.5);

  setDrawColor(doc, colors.border);
  doc.line(
    pageMarginX,
    y + 8,
    doc.internal.pageSize.getWidth() - pageMarginX,
    y + 8,
  );

  return y + 12;
}

function addOverviewTable(
  doc: JsPdfDocument,
  autoTable: AutoTableFn,
  context: PdfContext,
  startY: number,
) {
  const rows = [
    ["Session ID", context.result.sessionId],
    ["Timestamp", context.result.timestamp],
    ["Execution Mode", getExecutionModeLabel(context.result.mode)],
    ["Provider", getAuditProviderLabel(context.result.provider)],
    ["Model Used", context.result.modelUsed],
    ["Industry Preset", industryLabel(context.config.industry)],
    ["Endpoint", context.config.endpoint],
    ["Audit Route", getAuditRouteLabel(context.config.mode)],
    ["Tests Executed", String(context.result.testsExecuted)],
    ["Mode Explanation", executionModeExplanation],
  ];

  return addTable(doc, autoTable, {
    startY,
    head: [["Field", "Value"]],
    body: rows,
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold" },
      1: { cellWidth: "auto" },
    },
  });
}

function addExecutiveNarrative(
  doc: JsPdfDocument,
  context: PdfContext,
  startY: number,
) {
  let y = addListBox(
    doc,
    context,
    startY,
    "Risk Summary",
    narrativeToBullets(context.result.executiveSummary.riskSummary),
  );

  y = addListBox(
    doc,
    context,
    y,
    "Top 3 Weaknesses",
    context.result.executiveSummary.topWeaknesses,
  );

  y = addListBox(
    doc,
    context,
    y,
    "Business Impact",
    narrativeToBullets(context.result.executiveSummary.businessImpact),
  );

  return addListBox(
    doc,
    context,
    y,
    "Recommended Next Actions",
    context.result.executiveSummary.nextActions,
  );
}

function narrativeToBullets(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function addListBox(
  doc: JsPdfDocument,
  context: PdfContext,
  startY: number,
  title: string,
  items: string[],
) {
  let y = ensurePageSpace(doc, context, startY, 14);
  const maxWidth = doc.internal.pageSize.getWidth() - pageMarginX * 2 - 12;
  const linesPerItem = items.map((item) => doc.splitTextToSize(item, maxWidth));
  const contentHeight =
    linesPerItem.reduce((sum, lines) => sum + lines.length * 4 + 2, 0) + 10;

  y = ensurePageSpace(doc, context, y, contentHeight);

  setFillColor(doc, colors.surface);
  setDrawColor(doc, colors.border);
  doc.roundedRect(
    pageMarginX,
    y - 1,
    doc.internal.pageSize.getWidth() - pageMarginX * 2,
    contentHeight,
    3,
    3,
    "FD",
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setTextColor(doc, colors.muted);
  doc.text(title.toUpperCase(), pageMarginX + 4, y + 4);

  let cursorY = y + 9;

  for (const lines of linesPerItem) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setTextColor(doc, colors.accent);
    doc.text("•", pageMarginX + 4, cursorY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setTextColor(doc, colors.ink);
    doc.text(lines, pageMarginX + 8, cursorY);

    cursorY += lines.length * 4 + 2;
  }

  return y + contentHeight + 4;
}

function addTopRiskCategoryRow(
  doc: JsPdfDocument,
  context: PdfContext,
  startY: number,
) {
  let y = ensurePageSpace(doc, context, startY, 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setTextColor(doc, colors.muted);
  doc.text("TOP RISK CATEGORIES", pageMarginX, y);

  y += 4.5;

  if (!context.result.topRiskCategories.length) {
    const lines = doc.splitTextToSize(
      "No category produced a failed finding in this session.",
      doc.internal.pageSize.getWidth() - pageMarginX * 2,
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setTextColor(doc, colors.ink);
    doc.text(lines, pageMarginX, y + 3);
    return y + lines.length * 4 + 4;
  }

  let x = pageMarginX;

  for (const category of context.result.topRiskCategories) {
    const pillWidth = Math.min(
      74,
      doc.getTextWidth(category.toUpperCase()) + 10,
    );

    if (x + pillWidth > doc.internal.pageSize.getWidth() - pageMarginX) {
      x = pageMarginX;
      y += 8;
    }

    setFillColor(doc, colors.accentSoft);
    setDrawColor(doc, colors.accent);
    doc.roundedRect(x, y, pillWidth, 6, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(doc, colors.accent);
    doc.text(category.toUpperCase(), x + 3, y + 4.1);

    x += pillWidth + 3;
  }

  return y + 10;
}

function addCategoryBreakdownTable(
  doc: JsPdfDocument,
  autoTable: AutoTableFn,
  context: PdfContext,
  startY: number,
) {
  return addTable(doc, autoTable, {
    startY,
    head: [[
      "Category",
      "Failed",
      "Passed",
      "Total",
      "Highest Severity",
    ]],
    body: context.result.categoryBreakdown.map((item) => [
      item.category,
      String(item.failedTests),
      String(item.passedTests),
      String(item.totalTests),
      item.failedTests === 0 ? "Low" : item.highestSeverity,
    ]),
    columnStyles: {
      0: { cellWidth: 64 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "center", cellWidth: 20 },
      4: { halign: "center", cellWidth: 36, fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section !== "body" || data.column.index !== 4) {
        return;
      }

      const failedCell = data.row.cells[1];
      const failedCount = Number(failedCell?.raw ?? 0);
      if (failedCount > 0) {
        applySeverityCellStyle(data.cell.styles, String(data.cell.raw ?? ""));
      }
    },
  });
}

function addFindingsSummaryTable(
  doc: JsPdfDocument,
  autoTable: AutoTableFn,
  context: PdfContext,
  startY: number,
) {
  return addTable(doc, autoTable, {
    startY,
    head: [[
      "Test",
      "Category",
      "Status",
      "Severity",
      "Response Excerpt",
    ]],
    body: context.result.findings.map((finding) => [
      finding.testName,
      finding.category,
      finding.status.toUpperCase(),
      finding.status === "passed" ? "Low" : finding.severity,
      finding.modelResponseExcerpt,
    ]),
    columnStyles: {
      0: { cellWidth: 34, fontStyle: "bold" },
      1: { cellWidth: 36 },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      4: { cellWidth: "auto" },
    },
    didParseCell: (data) => {
      if (data.section !== "body") {
        return;
      }

      if (data.column.index === 2) {
        applyStatusCellStyle(data.cell.styles, String(data.cell.raw ?? ""));
      }

      if (data.column.index === 3) {
        const statusCell = data.row.cells[2];
        const status = String(statusCell?.raw ?? "").toLowerCase();
        if (status.includes("fail")) {
          applySeverityCellStyle(data.cell.styles, String(data.cell.raw ?? ""));
        }
      }
    },
  });
}

function addEvidenceTable(
  doc: JsPdfDocument,
  autoTable: AutoTableFn,
  context: PdfContext,
  startY: number,
) {
  return addTable(doc, autoTable, {
    startY,
    head: [["Finding", "Severity", "Evidence Snippet"]],
    body: context.result.evidenceSnippets.map((item) => [
      item.title,
      item.severity,
      item.snippet,
    ]),
    columnStyles: {
      0: { cellWidth: 40, fontStyle: "bold" },
      1: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      2: { cellWidth: "auto" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        applySeverityCellStyle(data.cell.styles, String(data.cell.raw ?? ""));
      }
    },
  });
}

function addBulletList(
  doc: JsPdfDocument,
  context: PdfContext,
  startY: number,
  bullets: string[],
) {
  let y = startY;
  const maxWidth = doc.internal.pageSize.getWidth() - pageMarginX * 2 - 8;

  for (const bullet of bullets) {
    const lines = doc.splitTextToSize(bullet, maxWidth);
    y = ensurePageSpace(doc, context, y, Math.max(10, lines.length * 4 + 4));

    setFillColor(doc, colors.surface);
    setDrawColor(doc, colors.border);
    doc.roundedRect(
      pageMarginX,
      y - 1,
      doc.internal.pageSize.getWidth() - pageMarginX * 2,
      lines.length * 4 + 5,
      2,
      2,
      "FD",
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setTextColor(doc, colors.accent);
    doc.text("•", pageMarginX + 3, y + 3.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setTextColor(doc, colors.ink);
    doc.text(lines, pageMarginX + 8, y + 3.2);

    y += lines.length * 4 + 8;
  }

  return y;
}

function addSecurityNote(
  doc: JsPdfDocument,
  context: PdfContext,
  startY: number,
) {
  const methodology = severityMethodologyEntries.map(
    (entry) => `${entry.severity}: ${entry.description}`,
  );
  const y = ensurePageSpace(
    doc,
    context,
    startY,
    26 + methodology.length * 5,
  );
  const width = doc.internal.pageSize.getWidth() - pageMarginX * 2;
  const note =
    "Secrets and API keys are intentionally excluded from this report.";
  const lines = doc.splitTextToSize(note, width - 12);
  const methodologyLines = methodology.flatMap((entry) =>
    doc.splitTextToSize(entry, width - 12),
  );
  const noteHeight = 19 + lines.length * 4 + methodologyLines.length * 4.5;

  setFillColor(doc, colors.navy);
  doc.roundedRect(pageMarginX, y, width, noteHeight, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setTextColor(doc, colors.accentSoft);
  doc.text("SECURITY NOTE", pageMarginX + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setTextColor(doc, colors.white);
  doc.text(lines, pageMarginX + 4, y + 11);

  const methodologyY = y + 15 + lines.length * 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setTextColor(doc, colors.accentSoft);
  doc.text(severityMethodologyTitle.toUpperCase(), pageMarginX + 4, methodologyY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setTextColor(doc, colors.white);
  doc.text(methodologyLines, pageMarginX + 4, methodologyY + 5);
}

function addTable(
  doc: JsPdfDocument,
  autoTable: AutoTableFn,
  options: UserOptions,
) {
  autoTable(doc, {
    theme: "grid",
    margin: { left: pageMarginX, right: pageMarginX },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.8,
      lineColor: colors.border,
      lineWidth: 0.2,
      textColor: colors.ink,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: colors.navy,
      textColor: colors.white,
      fontStyle: "bold",
      lineColor: colors.navy,
    },
    bodyStyles: {
      fillColor: colors.white,
    },
    alternateRowStyles: {
      fillColor: colors.surface,
    },
    ...options,
  });

  return getAutoTableFinalY(doc, Number(options.startY ?? 20)) + 8;
}

function ensurePageSpace(
  doc: JsPdfDocument,
  context: PdfContext,
  y: number,
  neededHeight: number,
) {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (y + neededHeight <= pageHeight - pageBottomMargin) {
    return y;
  }

  doc.addPage();
  return drawContinuationHeader(doc, context);
}

function drawContinuationHeader(doc: JsPdfDocument, context: PdfContext) {
  const pageWidth = doc.internal.pageSize.getWidth();

  setFillColor(doc, colors.navy);
  doc.rect(0, 0, pageWidth, continuationHeaderHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setTextColor(doc, colors.white);
  doc.text("Sentinel Veritas Report", pageMarginX, 8.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(context.result.sessionId, pageMarginX, 13.5);

  return continuationHeaderHeight + 8;
}

function addDocumentChrome(doc: JsPdfDocument, context: PdfContext) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    doc.setPage(pageIndex);

    if (pageIndex > 1) {
      setTextColor(doc, colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        `${context.result.sessionId} · ${getExecutionModeLabel(context.result.mode)}`,
        pageWidth - pageMarginX,
        8,
        { align: "right" },
      );
    }

    setDrawColor(doc, colors.border);
    doc.line(pageMarginX, pageHeight - 10.5, pageWidth - pageMarginX, pageHeight - 10.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, colors.muted);
    doc.text("Sentinel Veritas Security Report", pageMarginX, pageHeight - 6);
    doc.text(`Page ${pageIndex} of ${pageCount}`, pageWidth - pageMarginX, pageHeight - 6, {
      align: "right",
    });
  }
}

function drawModePill(
  doc: JsPdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
) {
  setFillColor(doc, colors.accentSoft);
  setDrawColor(doc, colors.accent);
  doc.roundedRect(x, y, width, height, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  setTextColor(doc, colors.accent);
  doc.text(label.toUpperCase(), x + width / 2, y + 6.2, {
    align: "center",
  });
}

function applyStatusCellStyle(
  styles: UserOptions["styles"],
  value: string,
) {
  if (!styles) {
    return;
  }

  if (value.toLowerCase().includes("fail")) {
    styles.fillColor = colors.rose;
    styles.textColor = colors.white;
    return;
  }

  styles.fillColor = colors.emerald;
  styles.textColor = colors.white;
}

function applySeverityCellStyle(
  styles: UserOptions["styles"],
  severity: string,
) {
  if (!styles) {
    return;
  }

  styles.fillColor = severityColor(severity);
  styles.textColor = colors.white;
}

function severityColor(severity: string): PdfColor {
  if (severity === "Critical") {
    return colors.rose;
  }

  if (severity === "High") {
    return [234, 88, 12];
  }

  if (severity === "Medium") {
    return colors.amber;
  }

  return colors.emerald;
}

function setFillColor(doc: JsPdfDocument, color: PdfColor) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDrawColor(doc: JsPdfDocument, color: PdfColor) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function setTextColor(doc: JsPdfDocument, color: PdfColor) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function getAutoTableFinalY(doc: JsPdfDocument, fallback: number) {
  return (doc as AutoTableDoc).lastAutoTable?.finalY ?? fallback;
}

function industryLabel(industry: AuditConfigSnapshot["industry"]) {
  if (industry === "insurance") {
    return "Insurance";
  }

  if (industry === "logistics") {
    return "Logistics";
  }

  if (industry === "retail") {
    return "Retail";
  }

  return "Healthcare";
}
