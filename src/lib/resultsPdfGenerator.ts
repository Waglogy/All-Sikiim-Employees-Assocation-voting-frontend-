import jsPDF from 'jspdf';
import type { ResultPost } from './api';
import { getResultPostTitle } from './api';

/**
 * Generate and download a detailed results report PDF
 */
export function generateResultsReportPDF(results: ResultPost[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const primaryColor = '#1a4f8b';
  const textColor = '#0f172a';
  const secondaryTextColor = '#475569';
  const borderColor = '#e2e8f0';
  const headerBgColor = '#f8fafc';

  const generatedDate = new Date().toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const safeText = (t: unknown, x: number, y: number) => {
    const str = t != null && typeof t !== 'string' ? String(t) : (t as string) ?? '';
    doc.text(str, Number(x), Number(y));
  };

  // Title
  doc.setFontSize(18);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  safeText('Voting Results Report', margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setTextColor(secondaryTextColor);
  doc.setFont('helvetica', 'normal');
  safeText(`Generated on ${generatedDate}`, margin, yPosition);
  yPosition += 10;

  const rowHeight = 7;
  const headerHeight = 8;

  results.forEach((post) => {
    const postTotal = post.candidates.reduce((s, c) => s + c.votes, 0);
    const sortedCandidates = post.candidates.slice().sort((a, b) => b.votes - a.votes);

    // Post title
    if (yPosition + 25 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    safeText(getResultPostTitle(post), margin, yPosition);
    yPosition += 6;

    // Table: Rank, Candidate, Votes
    const colWidths = { rank: 18, name: contentWidth - 18 - 25, votes: 25 };
    doc.setFillColor(headerBgColor);
    doc.rect(margin, yPosition - 4, contentWidth, headerHeight, 'F');
    doc.setDrawColor(borderColor);
    doc.rect(margin, yPosition - 4, contentWidth, headerHeight, 'S');
    doc.setFontSize(9);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    safeText('Rank', margin + 3, yPosition + 2);
    safeText('Candidate', margin + colWidths.rank + 3, yPosition + 2);
    safeText('Votes', margin + contentWidth - colWidths.votes, yPosition + 2);
    yPosition += headerHeight + 2;

    doc.setFontSize(9);
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');

    sortedCandidates.forEach((c, idx) => {
      if (yPosition + rowHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setDrawColor(borderColor);
      doc.rect(margin, yPosition - 4, contentWidth, rowHeight, 'S');
      safeText(idx + 1, margin + 4, yPosition + 2);
      const name = doc.splitTextToSize(String(c?.name ?? ''), colWidths.name - 4);
      safeText(Array.isArray(name) ? name[0] : name, margin + colWidths.rank + 3, yPosition + 2);
      safeText(c.votes, margin + contentWidth - colWidths.votes, yPosition + 2);
      yPosition += rowHeight;
    });

    doc.setFont('helvetica', 'bold');
    safeText(`Total votes: ${postTotal}`, margin, yPosition + 4);
    doc.setFont('helvetica', 'normal');
    yPosition += 14;
  });

  // Footer on each page
  const totalPages = (doc as unknown as { getNumberOfPages(): number }).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(secondaryTextColor);
    doc.setFont('helvetica', 'normal');
    safeText(
      `Page ${i} of ${totalPages} | ASGEA Voting Results | ${generatedDate}`,
      margin,
      pageHeight - 8
    );
  }

  const fileName = `ASGEA_Results_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
