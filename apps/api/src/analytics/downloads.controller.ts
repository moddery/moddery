import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { type Request, type Response } from 'express';

import { Public } from '../auth/decorators/public.decorator.js';
import { AnalyticsService } from './analytics.service.js';
import { analyticsRequestMetadata } from './request-metadata.js';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Public()
  @Get('files/:fileId')
  async downloadFile(
    @Param('fileId') fileId: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const download = await this.analytics.prepareFileDownload(
      fileId,
      analyticsRequestMetadata(request),
    );
    response.redirect(302, download.url);
  }
}
