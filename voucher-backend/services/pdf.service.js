const PDFDocument = require('pdfkit');

/**
 * Generate a voucher PDF as a buffer
 */
const generateVoucherPDF = (redemption, user, voucher) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ── Header ──────────────────────────────────────────────────────
      doc
        .fillColor('#1a1a2e')
        .rect(0, 0, doc.page.width, 120)
        .fill();

      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(28)
        .text('VOUCHER', 50, 35, { align: 'center' });

      doc
        .fontSize(12)
        .font('Helvetica')
        .text('Voucher Redemption System', 50, 68, { align: 'center' });

      doc
        .fontSize(10)
        .text(`Generated: ${new Date().toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 90, { align: 'center' });

      // ── Voucher Title ────────────────────────────────────────────────
      doc.moveDown(3);
      doc
        .fillColor('#1a1a2e')
        .font('Helvetica-Bold')
        .fontSize(22)
        .text(voucher.title || redemption.voucherSnapshot?.title, { align: 'center' });

      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#555555')
        .text(`By ${voucher.merchant || redemption.voucherSnapshot?.merchant}`, { align: 'center' });

      // ── Divider ──────────────────────────────────────────────────────
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#dddddd').stroke();
      doc.moveDown(1);

      // ── Discount Badge ───────────────────────────────────────────────
      const discount = redemption.voucherSnapshot?.discountType === 'percentage'
        ? `${redemption.voucherSnapshot?.discountValue}% OFF`
        : `RM${redemption.voucherSnapshot?.discountValue} OFF`;

      doc
        .fillColor('#e63946')
        .font('Helvetica-Bold')
        .fontSize(36)
        .text(discount, { align: 'center' });

      doc.moveDown(0.5);

      // ── Details Table ────────────────────────────────────────────────
      const tableTop = doc.y + 10;
      const col1 = 80;
      const col2 = 280;
      const rowH = 30;

      const details = [
        ['Redemption Code', redemption.redemptionCode],
        ['Category', (voucher.category || redemption.voucherSnapshot?.category || '').toUpperCase()],
        ['Redeemed By', user.name],
        ['Email', user.email],
        ['Valid Until', new Date(redemption.expiresAt).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })],
        ['Status', redemption.status.toUpperCase()],
        ['Points Used', `${redemption.pointsUsed} pts`],
      ];

      details.forEach(([label, value], i) => {
        const y = tableTop + i * rowH;
        if (i % 2 === 0) {
          doc.fillColor('#f8f9fa').rect(50, y - 5, doc.page.width - 100, rowH).fill();
        }
        doc.fillColor('#888888').font('Helvetica').fontSize(10).text(label, col1, y);
        doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(10).text(value, col2, y);
      });

      const afterTable = tableTop + details.length * rowH + 20;
      doc.y = afterTable;

      // ── Divider ──────────────────────────────────────────────────────
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#dddddd').stroke();
      doc.moveDown(1);

      // ── QR Code Placeholder / Base64 ────────────────────────────────
      if (redemption.qrCodeData && redemption.qrCodeData.startsWith('data:image')) {
        try {
          const base64Data = redemption.qrCodeData.split(',')[1];
          const imgBuffer = Buffer.from(base64Data, 'base64');
          const qrX = (doc.page.width - 120) / 2;
          doc.image(imgBuffer, qrX, doc.y, { width: 120, height: 120 });
          doc.moveDown(0.5);
          doc.y = doc.y + 130;
        } catch (e) {
          // Skip QR if image fails
        }
      }

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#aaaaaa')
        .text('Scan QR code or present this voucher to redeem', { align: 'center' });

      // ── Terms ────────────────────────────────────────────────────────
      if (voucher.terms) {
        doc.moveDown(1.5);
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#333333')
          .text('Terms & Conditions', { underline: true });
        doc.moveDown(0.3);
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#666666')
          .text(voucher.terms, { width: doc.page.width - 100 });
      }

      // ── Footer ───────────────────────────────────────────────────────
      doc
        .fontSize(8)
        .fillColor('#aaaaaa')
        .text(
          `This voucher is non-transferable. Code: ${redemption.redemptionCode}`,
          50,
          doc.page.height - 60,
          { align: 'center', width: doc.page.width - 100 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateVoucherPDF };
