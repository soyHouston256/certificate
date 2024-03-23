import { join } from 'path';
import { Course } from './enums/enums';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import qrcode = require('qrcode');

export class PDFService {
  async generarPDF(dto: Course): Promise<Buffer> {
    console.log(dto);

    const pdfBuffer: Buffer = await new Promise(async (resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        bufferPages: true,
        autoFirstPage: false,
      });

      for (const student of dto.students) {
        doc.addPage();

        doc.font('Helvetica-Bold').fontSize(24);
        doc.image(join(process.cwd(), './assets/background.png'), 0, 0, {
          width: doc.page.width,
          height: doc.page.height,
        });

        doc.text('', 0, 220);
        doc.font('Helvetica-Bold').fontSize(24);
        doc.text(student.name, {
          width: doc.page.width,
          align: 'center',
        });

        const document = student.document;

        if (document) {
          console.log('si hay doc');
          const qrBuffer = await this.generateQR(document);
          doc.image(qrBuffer, 0, doc.page.height - 150, {
            width: 150,
            height: 150,
          });
        } else {
          console.warn(`Student ${student.name} has no document for QR code`);
        }
      }

      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
      doc.end();
    });

    return pdfBuffer;
  }

  async generateQR(text: string): Promise<Buffer> {
    return qrcode.toBuffer(text.toString(), { errorCorrectionLevel: 'H' });
  }
}
