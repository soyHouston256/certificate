import { createPdf } from '@saemhco/nestjs-html-pdf';
import * as path from 'path';
import { join } from 'path';
import { Course } from './enums/enums';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import qrcode = require('qrcode');

export class PDFService {
  async firstExample() {
    const filePath = path.join(process.cwd(), 'templates', 'pdf-profile.hbs');
    return createPdf(filePath);
  }
  secondExample() {
    const data = {
      name: 'My PDF file',
    };
    const options = {
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
        left: '10mm',
        top: '25mm',
        right: '10mm',
        bottom: '15mm',
      },
      landscape: true,
    };
    const filePath = path.join(process.cwd(), 'templates', 'pdf-profile.hbs');
    return createPdf(filePath, options, data);
  }

  async generarPDF(dto: Course): Promise<Buffer> {
    console.log(dto);

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        bufferPages: true,
        autoFirstPage: false,
      });

      dto.students.forEach(async (student) => {
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
          const qrBuffer = await qrcode.toBuffer(document, {
            errorCorrectionLevel: 'H',
          });
          doc.image(qrBuffer, 0, 0, {
            width: 200,
            height: 200,
          });
        } else {
          console.warn(`Student ${student.name} has no document for QR code`);
        }
      });

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

  async generarQR(texto: string): Promise<Buffer> {
    return qrcode.toBuffer(texto, { errorCorrectionLevel: 'H' });
  }
}
