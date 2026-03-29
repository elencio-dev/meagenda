import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface ReceiptData {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  professionalName: string;
  date: Date;
  time: string;
  servicePrice: number;
  notes?: string;
  businessName: string;
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // A4 size
  const page = pdfDoc.addPage([595.28, 841.89]);
  const height = page.getHeight();
  const width = page.getWidth();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const dateStr = data.date.toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Header Background (coral)
  page.drawRectangle({
    x: 0, y: height - 120, width, height: 120, color: rgb(232/255, 80/255, 58/255)
  });

  // Header Text
  page.drawText("Comprovante", {
    x: 50, y: height - 60, size: 24, font: fontBold, color: rgb(1, 1, 1)
  });
  page.drawText(data.businessName, {
    x: 50, y: height - 90, size: 14, font: fontRegular, color: rgb(1, 1, 1)
  });

  // Title
  let currentY = height - 160;
  page.drawText("Agendamento confirmado!", {
    x: 50, y: currentY, size: 14, font: fontBold, color: rgb(34/255, 197/255, 94/255)
  });
  currentY -= 40;

  const drawRow = (label: string, value: string, highlight = false, ypos: number) => {
    // Label
    page.drawText(label, {
      x: 50, y: ypos, size: 12, font: fontRegular, color: rgb(138/255, 138/255, 130/255)
    });

    // Value (Right aligned approximation)
    const valWidth = (highlight ? fontBold : fontRegular).widthOfTextAtSize(value, 12);
    page.drawText(value, {
      x: 545 - valWidth, y: ypos, size: 12, font: highlight ? fontBold : fontRegular,
      color: highlight ? rgb(232/255, 80/255, 58/255) : rgb(26/255, 26/255, 24/255)
    });

    // Separator line
    page.drawLine({
      start: { x: 50, y: ypos - 15 },
      end: { x: 545, y: ypos - 15 },
      thickness: 1,
      color: rgb(240/255, 239/255, 232/255)
    });
  };

  drawRow("Nome", data.clientName, false, currentY); currentY -= 40;
  drawRow("E-mail", data.clientEmail, false, currentY); currentY -= 40;
  drawRow("Telefone", data.clientPhone, false, currentY); currentY -= 40;
  drawRow("Serviço", data.serviceName, false, currentY); currentY -= 40;
  drawRow("Profissional", data.professionalName, false, currentY); currentY -= 40;
  drawRow("Data", dateStr, false, currentY); currentY -= 40;
  drawRow("Horário", data.time, true, currentY); currentY -= 40;
  drawRow("Valor", `R$ ${data.servicePrice.toFixed(2)}`, true, currentY); currentY -= 40;

  if (data.notes) {
    drawRow("Obs.", data.notes, false, currentY);
    currentY -= 40;
  }

  // Footer
  currentY -= 40;
  const footer1 = "Apresente este comprovante impresso ou na tela do celular no dia do atendimento.";
  const f1w = fontRegular.widthOfTextAtSize(footer1, 10);
  page.drawText(footer1, {
    x: (width - f1w) / 2, y: currentY, size: 10, font: fontRegular, color: rgb(138/255, 138/255, 130/255)
  });
  
  currentY -= 15;
  const footer2 = `ID: N ${String(data.id).padStart(6, "0")}`;
  const f2w = fontRegular.widthOfTextAtSize(footer2, 10);
  page.drawText(footer2, {
    x: (width - f2w) / 2, y: currentY, size: 10, font: fontRegular, color: rgb(191/255, 191/255, 186/255)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
