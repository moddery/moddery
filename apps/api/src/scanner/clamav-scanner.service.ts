import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection, type Socket } from 'node:net';

const CLAMAV_TIMEOUT_MS = 120_000;

export interface ClamavScanResult {
  rawResponse: string;
  signature: string | null;
  status: 'COMPLETE';
  verdict: 'CLEAN' | 'MALWARE';
}

@Injectable()
export class ClamavScannerService {
  constructor(private readonly config: ConfigService) {}

  async scanUrl(url: string): Promise<ClamavScanResult> {
    const response = await fetchScanTarget(url);
    if (!response.ok) {
      throw new BadGatewayException('File download failed before scan');
    }

    if (response.body === null) {
      throw new BadGatewayException('File download did not return a body');
    }

    const rawResponse = await this.scanReadableStream(response.body);
    return parseClamavResponse(rawResponse);
  }

  private async scanReadableStream(
    stream: ReadableStream<Uint8Array>,
  ): Promise<string> {
    const host = this.config.getOrThrow<string>('scanner.clamavHost');
    const port = this.config.getOrThrow<number>('scanner.clamavPort');
    const socket = createConnection({ host, port });

    let responsePromise: Promise<string> | undefined;

    try {
      await waitForConnection(socket);
      responsePromise = readSocketResponse(socket);
      await writeSocket(socket, Buffer.from('zINSTREAM\0'));

      const reader = stream.getReader();
      try {
        for (;;) {
          const result = await reader.read();
          if (result.done) {
            break;
          }

          await writeScanChunk(socket, result.value);
        }
      } finally {
        reader.releaseLock();
      }

      await writeSocket(socket, Buffer.alloc(4));
      socket.end();
      return await responsePromise;
    } catch (caught) {
      socket.destroy();
      void responsePromise?.catch(() => undefined);
      if (caught instanceof GatewayTimeoutException) {
        throw caught;
      }

      throw new ServiceUnavailableException('ClamAV scan failed');
    }
  }
}

export function parseClamavResponse(rawResponse: string): ClamavScanResult {
  const response = rawResponse.replace(/\0+$/u, '').trim();
  if (response.endsWith(' OK')) {
    return {
      rawResponse: response,
      signature: null,
      status: 'COMPLETE',
      verdict: 'CLEAN',
    };
  }

  if (response.endsWith(' FOUND')) {
    const signature = response
      .replace(/^stream:\s*/u, '')
      .replace(/\s+FOUND$/u, '')
      .trim();

    return {
      rawResponse: response,
      signature: signature.length === 0 ? null : signature,
      status: 'COMPLETE',
      verdict: 'MALWARE',
    };
  }

  throw new BadGatewayException('ClamAV returned an unrecognized scan result');
}

async function fetchScanTarget(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch {
    throw new BadGatewayException('File download failed before scan');
  }
}

async function waitForConnection(socket: Socket): Promise<void> {
  await withTimeout(
    new Promise<void>((resolve, reject) => {
      socket.once('connect', resolve);
      socket.once('error', reject);
    }),
  );
}

async function writeScanChunk(
  socket: Socket,
  chunk: Uint8Array,
): Promise<void> {
  const size = Buffer.alloc(4);
  size.writeUInt32BE(chunk.byteLength, 0);
  await writeSocket(socket, size);
  await writeSocket(socket, Buffer.from(chunk));
}

async function writeSocket(socket: Socket, chunk: Buffer): Promise<void> {
  await withTimeout(
    new Promise<void>((resolve, reject) => {
      socket.write(chunk, (error?: Error | null) => {
        if (error === undefined || error === null) {
          resolve();
          return;
        }

        reject(error);
      });
    }),
  );
}

async function readSocketResponse(socket: Socket): Promise<string> {
  return withTimeout(
    new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      socket.on('data', (chunk: Buffer) => {
        chunks.push(Buffer.from(chunk));
      });
      socket.once('end', () => {
        resolve(Buffer.concat(chunks).toString('utf8').trim());
      });
      socket.once('error', reject);
    }),
  );
}

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      reject(new GatewayTimeoutException('ClamAV scan timed out'));
    }, CLAMAV_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
}
