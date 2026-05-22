import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from "date-fns";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvents } from "@/providers/EventsProvider";
import type { CalendarEvent } from "@/types/event";

const CATEGORY_LABEL: Record<string, string> = {
  work: "Work",
  rest: "Rest",
  wellness: "Wellness",
  exercise: "Exercise",
  social: "Social",
  family: "Family",
  personal: "Personal",
  travel: "Travel",
};

export function ExportSection() {
  const { events } = useEvents();
  const [busy, setBusy] = useState<"pdf" | "csv" | null>(null);

  async function exportPdf() {
    try {
      setBusy("pdf");
      const now = new Date();
      const monthLabel = format(now, "MMMM yyyy");
      const filename = `Kookaflow-${format(now, "MMMM")}-${format(now, "yyyy")}.pdf`;
      generateMonthlyPdf(events, now, monthLabel).save(filename);
      toast.success("Monthly report downloaded");
    } catch (e) {
      toast.error((e as Error).message || "Could not generate PDF");
    } finally {
      setBusy(null);
    }
  }

  function exportCsv() {
    try {
      setBusy("csv");
      const csv = eventsToCsv(events);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kookaflow-events-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (e) {
      toast.error((e as Error).message || "Could not generate CSV");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="size-4 text-primary" /> Export
        </CardTitle>
        <CardDescription>Download your data for record-keeping or sharing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={exportPdf}
          disabled={busy !== null}
        >
          <FileText className="size-4 text-primary" />
          {busy === "pdf" ? "Generating…" : "Export Monthly Report"}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={exportCsv}
          disabled={busy !== null}
        >
          <FileSpreadsheet className="size-4 text-primary" />
          {busy === "csv" ? "Generating…" : "Export Events as CSV"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------- helpers ----------

function eventsToCsv(events: CalendarEvent[]): string {
  const headers = [
    "Date",
    "Title",
    "Category",
    "Shift Type",
    "Start Time",
    "End Time",
    "Duration (hrs)",
    "Earnings",
  ];
  const rows = events.map((e) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const hours = Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
    return [
      format(start, "yyyy-MM-dd"),
      e.title,
      CATEGORY_LABEL[e.category] ?? e.category,
      e.shift?.shiftType ?? "",
      format(start, "HH:mm"),
      format(end, "HH:mm"),
      hours.toFixed(2),
      "",
    ];
  });
  return [headers, ...rows]
    .map((r) => r.map(csvCell).join(","))
    .join("\n");
}

function csvCell(v: string | number): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function generateMonthlyPdf(events: CalendarEvent[], anchor: Date, monthLabel: string): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 32;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("Kookaflow", margin, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Monthly Report — ${monthLabel}`, margin, 68);

  // Calendar grid
  const gridTop = 96;
  const gridLeft = margin;
  const gridRight = pageWidth - margin;
  const cellW = (gridRight - gridLeft) / 7;
  const cellH = 70;

  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Day-of-week header
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d, i) => {
    doc.text(d, gridLeft + i * cellW + 4, gridTop - 6);
  });

  // Group events by yyyy-MM-dd
  const byDay = new Map<string, CalendarEvent[]>();
  events.forEach((e) => {
    const k = format(new Date(e.start), "yyyy-MM-dd");
    const arr = byDay.get(k) ?? [];
    arr.push(e);
    byDay.set(k, arr);
  });

  doc.setDrawColor(226, 232, 240);
  days.forEach((d, idx) => {
    const row = Math.floor(idx / 7);
    const col = idx % 7;
    const x = gridLeft + col * cellW;
    const y = gridTop + row * cellH;
    doc.rect(x, y, cellW, cellH);
    doc.setFontSize(9);
    doc.setTextColor(isSameMonth(d, anchor) ? 15 : 200, 23, 42);
    doc.text(String(d.getDate()), x + 4, y + 12);

    const dayEvents = (byDay.get(format(d, "yyyy-MM-dd")) ?? []).slice(0, 3);
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    dayEvents.forEach((e, i) => {
      const label = e.title.length > 18 ? e.title.slice(0, 17) + "…" : e.title;
      doc.text(`• ${label}`, x + 4, y + 24 + i * 10);
    });
  });

  // Totals by category (for this month only)
  const inMonth = events.filter((e) => isSameMonth(new Date(e.start), anchor));
  const totals = new Map<string, number>();
  inMonth.forEach((e) => {
    const hrs = Math.max(0, (new Date(e.end).getTime() - new Date(e.start).getTime()) / 3_600_000);
    totals.set(e.category, (totals.get(e.category) ?? 0) + hrs);
  });

  const totalsTop = gridTop + Math.ceil(days.length / 7) * cellH + 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Total hours by category", margin, totalsTop);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  let y = totalsTop + 18;
  const sortedTotals = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  sortedTotals.forEach(([cat, hrs]) => {
    doc.text(`${CATEGORY_LABEL[cat] ?? cat}`, margin, y);
    doc.text(`${hrs.toFixed(1)} h`, margin + 200, y);
    y += 16;
  });
  if (sortedTotals.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.text("No events this month.", margin, y);
    y += 16;
  }

  // Balance score: simple ratio of non-work to total hours.
  const totalHrs = [...totals.values()].reduce((a, b) => a + b, 0);
  const workHrs = totals.get("work") ?? 0;
  const score = totalHrs === 0 ? 0 : Math.round(((totalHrs - workHrs) / totalHrs) * 100);

  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Balance score: ${score}/100`, margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Share of non-work time across logged activities this month.",
    margin,
    y + 14,
  );

  return doc;
}