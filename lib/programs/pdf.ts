import { readFileSync } from "node:fs";
import path from "node:path";

import type { Program } from "@prisma/client";
import { jsPDF } from "jspdf";

import { repairPotentialMojibake } from "@/lib/programs/normalize";
import { defaultPdfVisibilitySettings, type PdfVisibilitySettings } from "@/lib/programs/pdf-visibility";

type PrintableProgram = Pick<
  Program,
  | "programName"
  | "universityName"
  | "programDegree"
  | "language"
  | "campus"
  | "academicYear"
  | "semester"
  | "quotaFull"
  | "currencyType"
  | "tuitionFee"
  | "discountedTuitionFee"
  | "prepSchoolFee"
  | "cashPaymentFee"
  | "depositPrice"
>;

type PdfRenderOptions = {
  pageIndex: number;
  totalPages: number;
  visibility?: PdfVisibilitySettings;
};

let arabicFontRegistered = false;
let arabicFontAvailable = true;

export function renderProgramPdfPage(doc: jsPDF, program: PrintableProgram, options: PdfRenderOptions) {
  ensureArabicFont(doc);

  const visibility = {
    ...defaultPdfVisibilitySettings,
    ...(options.visibility ?? {})
  };

  const title = cleanText(program.programName);
  const university = cleanText(program.universityName);
  const currency = cleanText(program.currencyType, "USD");

  const overviewRows = [
    ["University", university],
    ["Program", title],
    ["Degree", cleanText(program.programDegree)],
    ["Language", cleanText(program.language)],
    ["Campus", cleanText(program.campus)],
    ["Academic Year", cleanText(program.academicYear)],
    ["Semester", cleanText(program.semester)],
    ["Quota Status", program.quotaFull ? "Quota full" : "Available"]
  ] as Array<[string, string]>;

  const visibleOverviewRows = overviewRows.filter(([label]) => {
    if (label === "University") return visibility.showUniversity;
    if (label === "Program") return visibility.showProgram;
    if (label === "Degree") return visibility.showDegree;
    if (label === "Language") return visibility.showLanguage;
    if (label === "Campus") return visibility.showCampus;
    if (label === "Academic Year") return visibility.showAcademicYear;
    if (label === "Semester") return visibility.showSemester;
    if (label === "Quota Status") return visibility.showQuotaStatus;
    return true;
  });

  const feeRows = [
    ["Currency", currency],
    ["Tuition Fee", printableCurrency(program.tuitionFee, currency)],
    ["Discounted Fee", printableCurrency(program.discountedTuitionFee, currency)],
    ["Prep School Fee", printableCurrency(program.prepSchoolFee, currency)],
    ["Cash Payment Fee", printableCurrency(program.cashPaymentFee, currency)],
    ["Deposit Price", printableCurrency(program.depositPrice, currency)]
  ] as Array<[string, string]>;

  const visibleFeeRows = feeRows.filter(([label]) => {
    if (label === "Currency") return visibility.showCurrency;
    if (label === "Tuition Fee") return visibility.showTuitionFee;
    if (label === "Discounted Fee") return visibility.showDiscountedFee;
    if (label === "Prep School Fee") return visibility.showPrepSchoolFee;
    if (label === "Cash Payment Fee") return visibility.showCashPaymentFee;
    if (label === "Deposit Price") return visibility.showDepositPrice;
    return true;
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentX = 32;
  const contentWidth = pageWidth - contentX * 2;
  const gutter = 12;
  const cellWidth = (contentWidth - gutter) / 2;

  const titleLines = splitForCell(doc, title, contentWidth - 36);
  const headerHeight = Math.max(98, 40 + titleLines.length * 18 + 34);

  doc.setFillColor(250, 248, 244);
  doc.setDrawColor(223, 214, 199);
  doc.roundedRect(contentX, 28, contentWidth, headerHeight, 14, 14, "FD");

  const pageBadge = `Page ${options.pageIndex + 1} of ${options.totalPages}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const badgeWidth = doc.getTextWidth(pageBadge) + 18;
  const badgeHeight = 18;
  const badgeX = contentX + contentWidth - badgeWidth - 12;
  const badgeY = 40;
  doc.setFillColor(236, 229, 216);
  doc.setDrawColor(223, 214, 199);
  doc.roundedRect(badgeX, badgeY - 12, badgeWidth, badgeHeight, 8, 8, "FD");
  doc.setTextColor(79, 67, 44);
  doc.text(pageBadge, badgeX + badgeWidth / 2, badgeY, { align: "center" });

  drawText(doc, titleLines, contentX + 14, 58, {
    color: [20, 42, 31],
    fontSize: 20,
    bold: true,
    maxWidth: contentWidth - 28
  });

  drawText(doc, university, contentX + 14, 68 + titleLines.length * 18, {
    color: [68, 55, 35],
    fontSize: 18,
    bold: true,
    maxWidth: contentWidth - 28
  });

  doc.setDrawColor(233, 225, 211);
  doc.line(contentX + 14, 80 + titleLines.length * 18, contentX + contentWidth - 14, 80 + titleLines.length * 18);

  let y = 28 + headerHeight + 16;

  if (visibleOverviewRows.length > 0) {
    y = drawSectionTitle(doc, "Program Overview", contentX, y);
    y = drawGridRows(doc, visibleOverviewRows, contentX, cellWidth, gutter, y);
    y += 8;
  }

  if (visibleFeeRows.length > 0) {
    y = drawSectionTitle(doc, "Financial Details", contentX, y);
    y = drawGridRows(doc, visibleFeeRows, contentX, cellWidth, gutter, y);
  }

  doc.setDrawColor(223, 214, 199);
  doc.line(contentX, pageHeight - 28, contentX + contentWidth, pageHeight - 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 102, 80);
  doc.text("Generated by Rehmat Education Dashboard", contentX, pageHeight - 14);
}

function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(52, 46, 37);
  doc.text(title, x, y);
  return y + 10;
}

function drawGridRows(doc: jsPDF, rows: Array<[string, string]>, x: number, cellWidth: number, gutter: number, startY: number) {
  let y = startY;

  for (let index = 0; index < rows.length; index += 2) {
    const left = rows[index];
    const right = rows[index + 1];

    const leftHeight = measureCellHeight(doc, left, cellWidth);
    const rightHeight = right ? measureCellHeight(doc, right, cellWidth) : leftHeight;
    const rowHeight = Math.max(leftHeight, rightHeight);

    drawCell(doc, left, x, y, cellWidth, rowHeight);

    if (right) {
      drawCell(doc, right, x + cellWidth + gutter, y, cellWidth, rowHeight);
    }

    y += rowHeight + 10;
  }

  return y;
}

function measureCellHeight(doc: jsPDF, row: [string, string], cellWidth: number) {
  const [, value] = row;
  const valueLines = splitForCell(doc, value, cellWidth - 24);
  return Math.max(52, 26 + valueLines.length * 15);
}

function drawCell(doc: jsPDF, row: [string, string], x: number, y: number, width: number, height: number) {
  const [label, value] = row;
  const isArabic = containsArabic(value) && arabicFontAvailable;
  const valueLines = splitForCell(doc, value, width - 24);

  doc.setDrawColor(223, 214, 199);
  doc.setFillColor(252, 249, 244);
  doc.roundedRect(x, y, width, height, 10, 10, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120, 102, 80);
  doc.text(label.toUpperCase(), x + 10, y + 15);

  drawText(doc, valueLines, isArabic ? x + width - 10 : x + 10, y + 34, {
    color: [17, 24, 39],
    fontSize: 12,
    bold: true,
    maxWidth: width - 20
  });
}

function drawText(
  doc: jsPDF,
  value: string | string[],
  x: number,
  y: number,
  options: {
    color: [number, number, number];
    fontSize: number;
    bold?: boolean;
    maxWidth: number;
  }
) {
  const raw = Array.isArray(value) ? value.join(" ") : value;
  const isArabic = containsArabic(raw);
  const processed = Array.isArray(value)
    ? value.map((line) => processArabicText(doc, line))
    : processArabicText(doc, value);

  if (isArabic && arabicFontAvailable) {
    doc.setFont("ArialUnicode", "normal");
    doc.setR2L(true);
  } else {
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setR2L(false);
  }

  doc.setFontSize(options.fontSize);
  doc.setTextColor(...options.color);

  doc.text(processed as string | string[], x, y, {
    maxWidth: options.maxWidth,
    align: isArabic ? "right" : "left"
  });

  doc.setR2L(false);
}

function splitForCell(doc: jsPDF, value: string, maxWidth: number) {
  const isArabic = containsArabic(value) && arabicFontAvailable;

  if (isArabic) {
    doc.setFont("ArialUnicode", "normal");
  } else {
    doc.setFont("helvetica", "normal");
  }

  const lines = doc.splitTextToSize(value, maxWidth) as string[];
  return lines.map((line) => processArabicText(doc, line));
}

function ensureArabicFont(doc: jsPDF) {
  if (!arabicFontAvailable) {
    return;
  }

  if (arabicFontRegistered) {
    return;
  }

  try {
    const fontPath = path.join(process.cwd(), "public", "fonts", "ArialUnicode.ttf");
    const fontData = readFileSync(fontPath).toString("base64");

    doc.addFileToVFS("ArialUnicode.ttf", fontData);
    doc.addFont("ArialUnicode.ttf", "ArialUnicode", "normal");

    arabicFontRegistered = true;
  } catch {
    arabicFontAvailable = false;
  }
}

function cleanText(value: string | null | undefined, fallback = "Not specified") {
  const repaired = repairPotentialMojibake(value ?? "").replace(/\s+/g, " ").trim();
  return repaired || fallback;
}

function processArabicText(doc: jsPDF, value: string) {
  if (!containsArabic(value)) {
    return value;
  }

  const processArabic = (doc as unknown as { processArabic?: (text: string) => string }).processArabic;
  return processArabic ? processArabic(value) : value;
}

function containsArabic(value: string) {
  return /[\u0600-\u06FF]/.test(value);
}

function printableCurrency(value: number | null, currency: string) {
  if (value === null || value === undefined) {
    return "Not specified";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2
  }).format(value);
}
