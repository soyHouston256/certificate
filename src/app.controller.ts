import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Course } from './enums/enums';
import { PDFService } from './pdf.service';

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
  @Post('generate')
  async generatePDF() {
    return this.pdfService.firstExample();
  }
  @Get('pdf')
  async generatePdf(@Res() res) {
    const buffer = await this.pdfService.secondExample();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=pdf.pdf`,
      'Content-Length': buffer.length,
      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    });
    res.end(buffer);
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
}
