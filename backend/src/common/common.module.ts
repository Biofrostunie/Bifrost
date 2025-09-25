import { Module, Global } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { PdfService } from './services/pdf.service';

@Global()
@Module({
  providers: [
    EmailService,
    {
      provide: PdfService,
      useClass: PdfService,
    },
  ],
  exports: [EmailService, PdfService],
})
export class CommonModule {}