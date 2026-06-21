import { BadGatewayException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { parseClamavResponse } from './clamav-scanner.service.js';

describe(parseClamavResponse.name, () => {
  test('maps clean responses to complete clean scans', () => {
    expect(parseClamavResponse('stream: OK')).toEqual({
      rawResponse: 'stream: OK',
      signature: null,
      status: 'COMPLETE',
      verdict: 'CLEAN',
    });
  });

  test('maps malware responses to complete malware scans', () => {
    expect(parseClamavResponse('stream: Eicar-Test-Signature FOUND\0')).toEqual(
      {
        rawResponse: 'stream: Eicar-Test-Signature FOUND',
        signature: 'Eicar-Test-Signature',
        status: 'COMPLETE',
        verdict: 'MALWARE',
      },
    );
  });

  test('rejects unrecognized responses', () => {
    expect(() => parseClamavResponse('stream: scan failed')).toThrow(
      BadGatewayException,
    );
  });
});
