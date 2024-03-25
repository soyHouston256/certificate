import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PDFService } from './pdf.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Directorio donde se guardarán los archivos subidos
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PDFService],
})
export class AppModule {}
