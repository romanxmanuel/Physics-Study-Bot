import { TextDecoder } from 'node:util';

const decoder = new TextDecoder('utf-8', { fatal: false });

export function extractTextFileFromBuffer(buffer) {
  return decoder
    .decode(buffer)
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .trim();
}
