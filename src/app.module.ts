import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PDFService } from './pdf.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PDFService],
})
export class AppModule {}
