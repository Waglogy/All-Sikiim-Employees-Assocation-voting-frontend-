import jsPDF from 'jspdf';
import { ElectoralVoter } from './api';

/**
 * Generate and download PDF for the entire electoral roll
 */
export function generateElectoralRollPDF(voters: ElectoralVoter[], totalVoters: number): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Colors
  const primaryColor = '#1a4f8b';
  const textColor = '#0f172a';
  const secondaryTextColor = '#475569';
  const borderColor = '#e2e8f0';
  const headerBgColor = '#f8fafc';

  // Header
  doc.setFontSize(18);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('ASGEA Electoral Roll', margin, yPosition);
  yPosition += 8;

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(secondaryTextColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Voters: ${totalVoters.toLocaleString()}`, margin, yPosition);
  yPosition += 10;

  // Table header
  const headerHeight = 8;
  const rowHeight = 7;
  const colWidths = {
    slNo: 15,
    name: 60,
    designation: 45,
    idNo: 40,
    formNo: 30,
  };

  // Draw header background
  doc.setFillColor(headerBgColor);
  doc.rect(margin, yPosition - 5, contentWidth, headerHeight, 'F');

  // Draw header borders
  doc.setDrawColor(borderColor);
  doc.rect(margin, yPosition - 5, contentWidth, headerHeight, 'S');

  // Header text
  doc.setFontSize(9);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  
  let xPos = margin + 3;
  doc.text('SL', xPos, yPosition);
  xPos += colWidths.slNo;
  doc.text('Name', xPos, yPosition);
  xPos += colWidths.name;
  doc.text('Designation', xPos, yPosition);
  xPos += colWidths.designation;
  doc.text('ID No', xPos, yPosition);
  xPos += colWidths.idNo;
  doc.text('Form No', xPos, yPosition);

  yPosition += headerHeight + 2;

  // Voters data
  doc.setFontSize(8);
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'normal');

  voters.forEach((voter, index) => {
    // Check if we need a new page
    if (yPosition + rowHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;

      // Redraw header on new page
      doc.setFillColor(headerBgColor);
      doc.rect(margin, yPosition - 5, contentWidth, headerHeight, 'F');
      doc.setDrawColor(borderColor);
      doc.rect(margin, yPosition - 5, contentWidth, headerHeight, 'S');
      
      doc.setFontSize(9);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      xPos = margin + 3;
      doc.text('SL', xPos, yPosition);
      xPos += colWidths.slNo;
      doc.text('Name', xPos, yPosition);
      xPos += colWidths.name;
      doc.text('Designation', xPos, yPosition);
      xPos += colWidths.designation;
      doc.text('ID No', xPos, yPosition);
      xPos += colWidths.idNo;
      doc.text('Form No', xPos, yPosition);
      yPosition += headerHeight + 2;

      doc.setFontSize(8);
      doc.setTextColor(textColor);
      doc.setFont('helvetica', 'normal');
    }

    // Draw row background (alternating)
    if (index % 2 === 0) {
      doc.setFillColor('#fafafa');
      doc.rect(margin, yPosition - 5, contentWidth, rowHeight, 'F');
    }

    // Draw row borders
    doc.setDrawColor(borderColor);
    doc.rect(margin, yPosition - 5, contentWidth, rowHeight, 'S');

    // Draw vertical lines
    xPos = margin + colWidths.slNo;
    doc.line(xPos, yPosition - 5, xPos, yPosition - 5 + rowHeight);
    xPos += colWidths.name;
    doc.line(xPos, yPosition - 5, xPos, yPosition - 5 + rowHeight);
    xPos += colWidths.designation;
    doc.line(xPos, yPosition - 5, xPos, yPosition - 5 + rowHeight);
    xPos += colWidths.idNo;
    doc.line(xPos, yPosition - 5, xPos, yPosition - 5 + rowHeight);

    // Cell content
    xPos = margin + 3;
    doc.text(voter.sl_no.toString(), xPos, yPosition);
    
    xPos += colWidths.slNo;
    const nameLines = doc.splitTextToSize(voter.name, colWidths.name - 6);
    doc.text(nameLines[0] || '', xPos, yPosition);
    
    xPos += colWidths.name;
    const designationLines = doc.splitTextToSize(voter.designation || '-', colWidths.designation - 6);
    doc.text(designationLines[0] || '-', xPos, yPosition);
    
    xPos += colWidths.designation;
    const idNoLines = doc.splitTextToSize(voter.id_no, colWidths.idNo - 6);
    doc.text(idNoLines[0] || '', xPos, yPosition);
    
    xPos += colWidths.idNo;
    doc.text(voter.form_no, xPos, yPosition);

    yPosition += rowHeight;
  });

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(secondaryTextColor);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      })}`,
      margin,
      pageHeight - 8
    );
  }

  // Download PDF
  const fileName = `ASGEA_Electoral_Roll_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
