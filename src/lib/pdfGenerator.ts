import jsPDF from 'jspdf';
import { PostResult } from './api';

/**
 * Generate and download PDF for a single post result
 */
export function generatePostPDF(postResult: PostResult): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Colors
  const primaryColor = '#1a4f8b';
  const textColor = '#0f172a';
  const secondaryTextColor = '#475569';
  const borderColor = '#e2e8f0';

  // Header
  doc.setFontSize(18);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('ASGEA Election Results', margin, yPosition);
  yPosition += 10;

  // Post Title
  doc.setFontSize(16);
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(postResult.post_title, margin, yPosition);
  yPosition += 8;

  // Total Votes
  doc.setFontSize(11);
  doc.setTextColor(secondaryTextColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Votes: ${postResult.total_votes}`, margin, yPosition);
  yPosition += 12;

  // Draw table header
  doc.setDrawColor(borderColor);
  doc.setFillColor(primaryColor);
  doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
  
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Candidate', margin + 5, yPosition);
  doc.text('Votes', margin + contentWidth - 60, yPosition);
  doc.text('Percentage', margin + contentWidth - 20, yPosition);
  yPosition += 10;

  // Candidates data
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  postResult.candidates.forEach((candidate, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }

    // Draw row background (alternating)
    if (index % 2 === 0) {
      doc.setFillColor('#f8fafc');
      doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
    }

    // Draw borders
    doc.setDrawColor(borderColor);
    doc.rect(margin, yPosition - 5, contentWidth, 8, 'S');

    // Candidate name
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(candidate.name, margin + 5, yPosition);

    // Votes
    doc.text(candidate.votes.toString(), margin + contentWidth - 60, yPosition);

    // Percentage
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text(`${candidate.percentage.toFixed(1)}%`, margin + contentWidth - 20, yPosition);

    yPosition += 8;
  });

  // Footer
  yPosition += 5;
  doc.setFontSize(8);
  doc.setTextColor(secondaryTextColor);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generated on ${new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`,
    margin,
    yPosition
  );

  // Download PDF
  const fileName = `${postResult.post_title.replace(/[^a-z0-9]/gi, '_')}_Results.pdf`;
  doc.save(fileName);
}
