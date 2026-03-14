import jsPDF from 'jspdf';
import type { ResultPost } from './api';

const PAGE_WIDTH = 210;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

const ORG_LINE1 = "All Sikkim Government Employees' Association (Group C&D)";
const ORG_LINE2 = 'Central Executive Committee Election (2026-2028)';
const FORM_TITLE = 'Form-VII (1)';
const RESULT_TITLE = 'Result of Counting of Votes';
const FOOTER_EC = 'Election Committee';

/**
 * Format date as "16th March, 2026"
 */
function formatResultDate(d: Date): string {
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  const month = d.toLocaleString('en-IN', { month: 'long' });
  const year = d.getFullYear();
  return `Date : ${day}${suffix} ${month}, ${year}.`;
}

/**
 * Generate and download Form-VII (1) "Result of Counting of Votes" PDF for one post.
 * @param post - Result post with title and candidates (name, votes)
 * @param logoBase64 - Optional base64 data URL for logo (e.g. from /logo.jpeg)
 * @param resultDate - Date to show on the form (default: today)
 */
export function generateFormVIIPDF(
  post: ResultPost,
  logoBase64?: string,
  resultDate: Date = new Date()
): void {
  const doc = new jsPDF();
  let y = MARGIN;

  // Logo (centered)
  if (logoBase64) {
    try {
      const logoW = 24;
      const logoH = 24;
      const logoX = (PAGE_WIDTH - logoW) / 2;
      doc.addImage(logoBase64, 'JPEG', logoX, y, logoW, logoH);
      y += logoH + 8;
    } catch {
      y += 2;
    }
  }

  // Organization & election (centered, bold)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(ORG_LINE1, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 6;
  doc.text(ORG_LINE2, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 12;

  // Form-VII (1)
  doc.setFontSize(12);
  doc.text(FORM_TITLE, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  // Result of Counting of Votes (bold + underline)
  doc.setFontSize(11);
  doc.text(RESULT_TITLE, PAGE_WIDTH / 2, y, { align: 'center' });
  const tw = doc.getTextWidth(RESULT_TITLE);
  doc.setDrawColor(0, 0, 0);
  doc.line((PAGE_WIDTH - tw) / 2, y + 1.5, (PAGE_WIDTH + tw) / 2, y + 1.5);
  y += 10;

  // Table: Sl No | Name of Contesting Candidate | Name of Post | Total Valid Votes
  const colWidths = { slNo: 18, candidate: 70, post: 45, votes: 35 };
  const headerHeight = 9;
  const rowHeight = 8;
  const tableTop = y;

  // Table header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  let x = MARGIN;
  doc.text('Sl No', x + colWidths.slNo / 2, y + 6, { align: 'center' });
  x += colWidths.slNo;
  doc.text('Name of Contesting Candidate', x + colWidths.candidate / 2, y + 6, { align: 'center' });
  x += colWidths.candidate;
  doc.text('Name of Post', x + colWidths.post / 2, y + 6, { align: 'center' });
  x += colWidths.post;
  doc.text('Total Valid Votes', x + colWidths.votes / 2, y + 6, { align: 'center' });

  doc.setDrawColor(0, 0, 0);
  doc.rect(MARGIN, tableTop, CONTENT_WIDTH, headerHeight, 'S');
  doc.line(MARGIN + colWidths.slNo, tableTop, MARGIN + colWidths.slNo, tableTop + headerHeight);
  doc.line(MARGIN + colWidths.slNo + colWidths.candidate, tableTop, MARGIN + colWidths.slNo + colWidths.candidate, tableTop + headerHeight);
  doc.line(MARGIN + colWidths.slNo + colWidths.candidate + colWidths.post, tableTop, MARGIN + colWidths.slNo + colWidths.candidate + colWidths.post, tableTop + headerHeight);
  y += headerHeight;

  // Rows: candidates sorted by votes descending (or keep order)
  const candidates = post.candidates.slice().sort((a, b) => b.votes - a.votes);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const postTitleStr = String(post.title ?? '');
  const centerPostX = MARGIN + colWidths.slNo + colWidths.candidate + colWidths.post / 2;
  const centerVotesX = MARGIN + colWidths.slNo + colWidths.candidate + colWidths.post + colWidths.votes / 2;

  candidates.forEach((c, i) => {
    const rowY = y + i * rowHeight;
    const slNo = String(i + 1);
    const name = String(c.name ?? '');
    const votes = String(c.votes ?? 0);

    doc.text(slNo, MARGIN + colWidths.slNo / 2, rowY + 5.5, { align: 'center' });
    doc.text(name, MARGIN + colWidths.slNo + 2, rowY + 5.5, { maxWidth: colWidths.candidate - 4 });
    doc.text(postTitleStr, centerPostX, rowY + 5.5, { align: 'center' });
    doc.text(votes, centerVotesX, rowY + 5.5, { align: 'center' });

    doc.rect(MARGIN, rowY, CONTENT_WIDTH, rowHeight, 'S');
    doc.line(MARGIN + colWidths.slNo, rowY, MARGIN + colWidths.slNo, rowY + rowHeight);
    doc.line(MARGIN + colWidths.slNo + colWidths.candidate, rowY, MARGIN + colWidths.slNo + colWidths.candidate, rowY + rowHeight);
    doc.line(MARGIN + colWidths.slNo + colWidths.candidate + colWidths.post, rowY, MARGIN + colWidths.slNo + colWidths.candidate + colWidths.post, rowY + rowHeight);
  });

  y += rowHeight * candidates.length + 14;

  // Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(formatResultDate(resultDate), MARGIN, y);
  y += 14;

  // Officer signature lines: numbers 1–5 only
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  for (let i = 1; i <= 5; i++) {
    doc.text(String(i), MARGIN, y);
    y += 7;
  }
  y += 6;

  // Footer
  doc.setFont('helvetica', 'bold');
  doc.text(FOOTER_EC, MARGIN, y);
  y += 6;
  doc.text(ORG_LINE1, MARGIN, y);
  y += 6;
  doc.text(ORG_LINE2, MARGIN, y);

  const safeTitle = (post.title ?? 'Post').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40);
  doc.save(`Form-VII-1-Result-of-Counting-${safeTitle}.pdf`);
}
