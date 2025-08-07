/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import AppError from "../errors/AppError";

export interface IInvoiceProduct {
  name: string;
  quantity: number;
  price: number;
}

export interface IInvoiceData {
  trackingId: string;
  orderDate: Date;
  userName: string;
  products: IInvoiceProduct[];
  totalAmount: number;
}

export const generatePdf = async (
  invoiceData: IInvoiceData
): Promise<Buffer> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers: Uint8Array[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // ========== HEADER ==========
      doc.fontSize(24).fillColor("#4B0082").text("ZeroFit", { align: "left" });
      doc
        .fontSize(10)
        .fillColor("#000")
        .text("Clothing & Accessories", { align: "left" });

      doc.moveUp(2);
      doc.fontSize(10).text("ZeroFit Company", 400);
      doc.text("Unit 8", 400);
      doc.text("123 Eco Street, Dhaka", 400);
      doc.text("Bangladesh", 400);
      doc.text("Phone: (+880) 1234-567890", 400);

      doc.moveDown(2);

      // ========== INVOICE TITLE ==========
      doc.fontSize(16).fillColor("#000").text("INVOICE", { align: "left" });
      doc.moveDown();

      // ========== BILL TO & INVOICE INFO ==========
      const top = doc.y;
      doc.fontSize(11).font("Helvetica-Bold").text("Bill To:", 50, top);
      doc.font("Helvetica").text(invoiceData.userName, 50, doc.y);
      doc.text("123 Customer St", 50);
      doc.text("Dhaka, Bangladesh", 50);
      doc.text("Phone: +880123456789", 50);
      doc.text("Email: example@email.com", 50);

      doc.fontSize(11).font("Helvetica-Bold").text("Invoice Number:", 350, top);
      doc.font("Helvetica").text(invoiceData.trackingId, 450, top);
      doc.font("Helvetica-Bold").text("Order Date:", 350);
      doc
        .font("Helvetica")
        .text(new Date(invoiceData.orderDate).toLocaleDateString(), 450);
      doc.font("Helvetica-Bold").text("Payment Method:", 350);
      doc.font("Helvetica").text("Credit Card (Stripe)", 450);

      doc.moveDown(2);

      // ========== TABLE HEADER ==========
      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Product", 50);
      doc.text("Quantity", 250);
      doc.text("Price", 400);
      doc
        .moveTo(50, doc.y + 2)
        .lineTo(550, doc.y + 2)
        .stroke();
      doc.moveDown(0.5);

      // ========== TABLE BODY ==========
      doc.font("Helvetica").fontSize(11);

      invoiceData.products.forEach((item) => {
        doc.text(item.name, 50);
        doc.text(`${item.quantity}`, 250);
        doc.text(`BDT ${item.price.toFixed(2)}`, 400);
        doc.moveDown(0.5);
      });

      doc.moveDown(1.5);

      // ========== TOTAL SECTION ==========
      doc.fontSize(11);
      doc.text(`Subtotal: BDT ${invoiceData.totalAmount.toFixed(2)}`, 400);
      doc.text(`Shipping: Free`, 400);
      doc
        .font("Helvetica-Bold")
        .text(`Total: BDT ${invoiceData.totalAmount.toFixed(2)}`, 400);
      doc.moveDown(4);

      // ========== FOOTER ==========
      doc
        .fontSize(10)
        .fillColor("gray")
        .text(
          "To get additional information or if you have any doubts, contact our customer support:",
          { align: "center" }
        );

      doc
        .fontSize(10)
        .fillColor("gray")
        .text("Email – support@zerofit.com", { align: "center" });

      doc
        .fontSize(10)
        .fillColor("gray")
        .text("Phone – (+880)1234567890", { align: "center" });

      doc.end();
    });
  } catch (error: any) {
    console.log(error);
    throw new AppError(401, `Pdf creation error: ${error.message}`);
  }
};
