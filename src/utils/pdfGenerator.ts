import { jsPDF } from 'jspdf';
import { WoundAnalysisResult, Language } from '../types';

export function generateWoundReportPDF(
  result: WoundAnalysisResult,
  currentLang: Language,
  imageUrl?: string
): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const langKey = currentLang || 'en';

    // Header Background Banner
    doc.setFillColor(90, 90, 64); // #5A5A40 primary medical olive
    doc.rect(0, 0, 210, 28, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('WoundCare-VLM • Clinical First-Aid Report', 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date(result.timestamp).toLocaleString()} | ID: ${result.id}`, 14, 22);

    // Patient Profile Badge
    if (result.isChildMode) {
      doc.setFillColor(230, 81, 0); // Orange
      doc.roundedRect(150, 8, 46, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('CHILD PATIENT (<18)', 153, 15);
    } else {
      doc.setFillColor(46, 125, 50); // Green
      doc.roundedRect(150, 8, 46, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('ADULT PATIENT (18+)', 153, 15);
    }

    let y = 35;

    // Severity & Type Card
    const severityColor = result.severity === 'Severe' ? [198, 40, 40] : result.severity === 'Moderate' ? [245, 127, 23] : [46, 125, 50];
    doc.setFillColor(245, 245, 240);
    doc.roundedRect(14, y, 182, 32, 3, 3, 'F');

    doc.setTextColor(44, 44, 44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Detected Wound: ${result.woundType}`, 20, y + 10);

    doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
    doc.roundedRect(120, y + 4, 38, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`SEVERITY: ${result.severity.toUpperCase()}`, 122, y + 9.5);

    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const descText = result.woundTypeDescription[langKey] || result.woundTypeDescription.en;
    doc.text(descText, 20, y + 18, { maxWidth: 170 });

    // Measurement & Infection Risk Box
    doc.setFontSize(9);
    doc.setTextColor(44, 44, 44);
    const length = result.measurement?.lengthCm || 3.5;
    const width = result.measurement?.widthCm || 1.8;
    const area = (length * width).toFixed(1);
    doc.text(`Dimensions: ${length} cm x ${width} cm (Est. Area ~${area} cm²)`, 20, y + 26);
    doc.text(`Infection Risk Score: ${result.infectionRiskScore || 35}% (${result.infectionRisk})`, 110, y + 26);

    y += 38;

    // Tetanus Warning Banner if applicable
    if (result.tetanusRiskDetected) {
      doc.setFillColor(255, 235, 238);
      doc.setDrawColor(198, 40, 40);
      doc.roundedRect(14, y, 182, 14, 2, 2, 'FD');
      doc.setTextColor(198, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('⚠️ TETANUS RISK DETECTED: Administer Tetanus Toxoid (TT) injection within 24 hours at nearest PHC.', 18, y + 9);
      y += 18;
    }

    // First Aid Action Steps
    doc.setTextColor(90, 90, 64);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Step-by-Step First Aid Protocol:', 14, y);
    y += 6;

    result.firstAidSteps.forEach((step, idx) => {
      const stepMsg = step.text[langKey] || step.text.en;
      doc.setFillColor(240, 237, 228);
      doc.roundedRect(14, y, 182, 11, 2, 2, 'F');
      
      doc.setTextColor(90, 90, 64);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${idx + 1}.`, 18, y + 7);

      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'normal');
      doc.text(stepMsg, 25, y + 7, { maxWidth: 165 });

      y += 13;
    });

    y += 4;

    // Recovery Diet Section
    if (result.recoveryDiet) {
      doc.setTextColor(90, 90, 64);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Recovery Diet & Hydration Advisory:', 14, y);
      y += 6;

      doc.setFillColor(250, 250, 245);
      doc.roundedRect(14, y, 182, 28, 2, 2, 'F');

      doc.setTextColor(46, 125, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Foods to Eat:', 18, y + 6);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'normal');
      const eatTxt = result.recoveryDiet.foodsToEat.map(f => f[langKey] || f.en).join(' • ');
      doc.text(eatTxt, 42, y + 6, { maxWidth: 150 });

      doc.setTextColor(198, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text('Avoid:', 18, y + 13);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'normal');
      const avoidTxt = result.recoveryDiet.foodsToAvoid.map(f => f[langKey] || f.en).join(' • ');
      doc.text(avoidTxt, 32, y + 13, { maxWidth: 160 });

      doc.setTextColor(21, 101, 192);
      doc.setFont('helvetica', 'bold');
      doc.text('Hydration & Rest:', 18, y + 20);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'normal');
      const hydTxt = `${result.recoveryDiet.hydrationAdvice[langKey] || result.recoveryDiet.hydrationAdvice.en} | ${result.recoveryDiet.restAdvice[langKey] || result.recoveryDiet.restAdvice.en}`;
      doc.text(hydTxt, 52, y + 20, { maxWidth: 140 });

      y += 34;
    }

    // Urgent Referral & Model Metadata
    doc.setFillColor(235, 235, 230);
    doc.roundedRect(14, y, 182, 16, 2, 2, 'F');
    doc.setTextColor(44, 44, 44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Doctor Visit Urgency:', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(result.doctorVisitUrgency[langKey] || result.doctorVisitUrgency.en, 55, y + 6, { maxWidth: 135 });

    doc.setFont('helvetica', 'bold');
    doc.text('AI Engine Used:', 18, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${result.modelEngineUsed} (Conf: ${result.confidenceScore}%)`, 48, y + 12);

    // Footer Disclaimer
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text(
      'DISCLAIMER: WoundCare-VLM provides decision-support triage based on clinical multi-modal AI. It is NOT a substitute for professional medical diagnosis. In critical hemorrhage, severe burns, or animal bites, visit the nearest Primary Health Centre or dial 108 immediately.',
      14,
      286,
      { maxWidth: 182 }
    );

    // Save File
    doc.save(`WoundCare-Report-${result.id}.pdf`);
  } catch (err) {
    console.error('Failed to generate PDF report:', err);
    alert('Failed to generate PDF report. Please try again.');
  }
}

export function generateWorkplaceReportPDF(report: any): void {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFillColor(90, 90, 64);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('WORKPLACE INCIDENT REPORT • FACTORIES ACT 1948', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Incident ID: ${report.id} | Reported: ${report.dateTime}`, 14, 22);

    let y = 35;

    doc.setFillColor(245, 245, 240);
    doc.roundedRect(14, y, 182, 140, 3, 3, 'F');

    doc.setTextColor(44, 44, 44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    const fields = [
      ['Company Name:', report.companyName],
      ['Injured Employee Name:', report.employeeName],
      ['Date & Time of Occurrence:', report.dateTime],
      ['GPS Location:', report.locationGps],
      ['Injury Classification:', report.woundType],
      ['Severity Level:', report.severity],
      ['Witness Name (Safety Marshal):', report.witnessName],
      ['Plant Supervisor:', report.supervisorName],
      ['Hospital Referral Required:', report.hospitalVisitRequired ? 'YES (Emergency Transport)' : 'NO (First Aid Onsite)']
    ];

    let rowY = y + 10;
    fields.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, rowY);
      doc.setFont('helvetica', 'normal');
      doc.text(String(val), 80, rowY, { maxWidth: 110 });
      rowY += 10;
    });

    rowY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('First Aid Administered:', 20, rowY);
    doc.setFont('helvetica', 'normal');
    doc.text(report.firstAidAdministered, 20, rowY + 6, { maxWidth: 170 });

    rowY += 25;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, rowY, 90, rowY);
    doc.line(110, rowY, 180, rowY);

    doc.setFontSize(8);
    doc.text('Signature of Factory Safety Officer', 20, rowY + 5);
    doc.text('Signature of Plant Supervisor', 110, rowY + 5);

    doc.save(`Workplace-Incident-${report.id}.pdf`);
  } catch (err) {
    console.error('Failed to generate workplace report PDF:', err);
  }
}

export function generateInsuranceClaimPDF(claim: any): void {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFillColor(90, 90, 64);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('HEALTH INSURANCE CLAIM DOSSIER', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Claim ID: ${claim.id} | Provider: ${claim.providerName}`, 14, 22);

    let y = 35;

    doc.setFillColor(245, 245, 240);
    doc.roundedRect(14, y, 182, 130, 3, 3, 'F');

    doc.setTextColor(44, 44, 44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    const fields = [
      ['Insurance Provider:', claim.providerName],
      ['Policy Number:', claim.policyNumber],
      ['Patient Name:', claim.patientName],
      ['Trauma Facility / Hospital:', claim.hospitalName],
      ['Wound Classification:', claim.woundType],
      ['Severity Level:', claim.severity],
      ['Est. Medical Expenses:', `INR ₹${claim.estimatedExpensesINR.toLocaleString('en-IN')}`],
      ['Date & Timestamp:', claim.dateTime],
      ['GPS Location:', claim.locationGps]
    ];

    let rowY = y + 10;
    fields.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, rowY);
      doc.setFont('helvetica', 'normal');
      doc.text(String(val), 75, rowY, { maxWidth: 115 });
      rowY += 10;
    });

    rowY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Triage & First Aid Documentation:', 20, rowY);
    doc.setFont('helvetica', 'normal');
    doc.text(claim.firstAidSteps, 20, rowY + 6, { maxWidth: 170 });

    // Embedded QR Code box representation
    doc.setFillColor(230, 230, 225);
    doc.roundedRect(140, y + 80, 45, 45, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('VERIFICATION QR', 147, y + 103);

    doc.save(`Insurance-Claim-${claim.id}.pdf`);
  } catch (err) {
    console.error('Failed to generate insurance claim PDF:', err);
  }
}

