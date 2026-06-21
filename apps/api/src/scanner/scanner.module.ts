import { Module } from '@nestjs/common';

import { ClamavScannerService } from './clamav-scanner.service.js';

@Module({
  exports: [ClamavScannerService],
  providers: [ClamavScannerService],
})
export class ScannerModule {}
