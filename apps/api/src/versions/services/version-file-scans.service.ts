import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ClamavScannerService } from '../../scanner/clamav-scanner.service.js';
import { type RecordFileScanInput } from '../dto/record-file-scan.input.js';
import {
  type VersionSummaryContract,
  versionRowToContract,
  versionSelect,
} from './version-read-model.js';

@Injectable()
export class VersionFileScansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scanner: ClamavScannerService,
  ) {}

  async recordFileScan(
    input: RecordFileScanInput,
    user: AuthenticatedUser,
  ): Promise<VersionSummaryContract> {
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw new ForbiddenException('Moderator access required');
    }

    const file = await this.prisma.versionFile.findUnique({
      select: {
        id: true,
        versionId: true,
      },
      where: { id: input.fileId },
    });

    if (file === null) {
      throw new NotFoundException('File not found');
    }

    const details = parseScanDetails(input.details);
    await this.prisma.fileScan.create({
      data: {
        details,
        fileId: file.id,
        status: requiredTrim(input.status, 'Scan status is required'),
        verdict: nullableTrim(input.verdict),
      },
    });

    const updated = await this.prisma.version.findUniqueOrThrow({
      select: versionSelect(),
      where: { id: file.versionId },
    });

    return versionRowToContract(updated);
  }

  async scanVersionFile(
    fileId: string,
    user: AuthenticatedUser,
  ): Promise<VersionSummaryContract> {
    assertCanModerate(user);

    const file = await this.prisma.versionFile.findUnique({
      select: {
        fileName: true,
        id: true,
        sizeBytes: true,
        url: true,
        versionId: true,
      },
      where: { id: fileId },
    });

    if (file === null) {
      throw new NotFoundException('File not found');
    }

    const scan = await this.scanner.scanUrl(file.url);
    await this.prisma.fileScan.create({
      data: {
        details: {
          engine: 'clamav',
          fileName: file.fileName,
          rawResponse: scan.rawResponse,
          scannedAt: new Date().toISOString(),
          signature: scan.signature,
          sizeBytes: file.sizeBytes.toString(),
        },
        fileId: file.id,
        status: scan.status,
        verdict: scan.verdict,
      },
    });

    const updated = await this.prisma.version.findUniqueOrThrow({
      select: versionSelect(),
      where: { id: file.versionId },
    });

    return versionRowToContract(updated);
  }
}

function assertCanModerate(user: AuthenticatedUser): void {
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new ForbiddenException('Moderator access required');
  }
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function requiredTrim(value: string, message: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new BadRequestException(message);
  }

  return trimmed;
}

function parseScanDetails(
  value: string | null | undefined,
): Prisma.InputJsonValue | undefined {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(trimmed) as Prisma.InputJsonValue;
  } catch {
    throw new BadRequestException('Scan details must be valid JSON');
  }
}
