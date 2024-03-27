import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Course } from './enums/enums';
import { PDFService } from './pdf.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly pdfService: PDFService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  postHello(@Body() dto: Course): string {
    return this.appService.postHello(dto);
  }

  @Post('pdf/download')
  async downloadPDF(@Body() dto: Course, @Res() res): Promise<void> {
    const buffer = await this.pdfService.generarPDF(dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=example.pdf',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Post('generatetor')
  async generatePDFold(@Body() requestData: any) {
    const { students } = requestData;
    const { code, background } = requestData;
    console.log(students);
    const generatedPDFs = [];
    for (const student of students) {
      console.log('student ', student);
      const pdfBuffer = await this.pdfService.generator300(
        student,
        code,
        background,
      );
      console.log('esto es', pdfBuffer);
      generatedPDFs.push(pdfBuffer);
    }

    return generatedPDFs;
  }

  @Post('generate')
  async generatePDFs(@Body() requestData: any) {
    const { students } = requestData;
    const { code, background } = requestData;
    const generatedPDFs = [];
    for (const student of students) {
      try {
        const filePath = await this.pdfService.generator300(
          student,
          code,
          background,
        );
        generatedPDFs.push(filePath);
      } catch (err) {
        console.error(
          `Error generating PDF for student ${student.name}: ${err}`,
        );
      }
    }

    return generatedPDFs;
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, file.originalname.split('.')[0] + '_' + Date.now() + '.png');
        },
      }),
    }),
  )
  @Post('upload')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      background: `${file.filename}`,
    };
  }
}
