import { Controller, Get, Param, Res } from '@nestjs/common';
import { type Response } from 'express';

import { Public } from '../auth/decorators/public.decorator.js';
import { AnalyticsService } from './analytics.service.js';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Public()
  @Get('files/:fileId')
  async downloadFile(
    @Param('fileId') fileId: string,
    @Res() response: Response,
  ): Promise<void> {
    const download = await this.analytics.prepareFileDownload(fileId);
    response.redirect(302, download.url);
  }
}
