import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { Course } from './enums/enums';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import qrcode = require('qrcode');
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PDFService {
  private readonly cwd: string;

  constructor() {
    this.cwd = process.cwd();
  }
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

  async generator300(
    student: any,
    code: string,
    background: string,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          bufferPages: true,
          autoFirstPage: false,
        });
        const web = 'https://soflands.com/certificados';
        //const encodeName = encodeURIComponent(student.document);
        const encodeName = uuidv4();
        const fileName = `${encodeName}.pdf`;
        const folderName = `./certificates/${code}`;
        const folderPath = join(process.cwd(), folderName); // Ruta de la carpeta
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }
        const filePath = join(folderPath, fileName);

        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        doc.addPage();
        doc.font('Helvetica-Bold').fontSize(24);
        //doc.image(join(process.cwd(), './assets/background.png'), 0, 0, {
        doc.image(join(process.cwd(), `./uploads/${background}`), 0, 0, {
          width: doc.page.width,
          height: doc.page.height,
        });
        doc.text('', 0, 280);
        doc.font('Helvetica-Bold').fontSize(24);
        doc.text(student.name.toUpperCase(), {
          width: doc.page.width,
          align: 'center',
        });

        const document = student.document;

        if (document) {
          const route = `${web}/${code}/${fileName}`;
          const qrBuffer = await this.generateQR(route); // Utiliza await dentro de una nueva función async
          doc.image(qrBuffer, 0, doc.page.height - 150, {
            width: 150,
            height: 150,
          });
        } else {
          console.warn(`Student ${student.name} has no document for QR code`);
        }

        doc.end();

        writeStream.on('finish', () => {
          //resolve(fileName);
          resolve(`${web}/${code}/${fileName}`);
        });
        writeStream.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async generatePDF(studentData: any): Promise<Buffer> {
    const { name, document } = studentData;

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
      });

      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(24);
      //doc.image(join(this.cwd, './assets/background.png'), 0, 0, {
      doc.image(join(process.cwd(), './assets/background.png'), 0, 0, {
        // Utilizamos this.cwd en join()
        width: doc.page.width,
        height: doc.page.height,
      });
      doc.text('', 0, 220);
      doc.font('Helvetica-Bold').fontSize(24);
      doc.text(name, {
        width: doc.page.width,
        align: 'center',
      });

      const qrText = document.toString();
      const qrBuffer = qrcode.toBuffer(qrText, { errorCorrectionLevel: 'H' });
      doc.image(qrBuffer, 200, 200, {
        width: 400,
        height: 400,
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

  async generateQR(text: string): Promise<Buffer> {
    return qrcode.toBuffer(text.toString(), { errorCorrectionLevel: 'H' });
  }
}
