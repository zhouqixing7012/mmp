import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ANNOTATION_PRD_REVISIONS } from './annotation-prd-revisions';

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}

describe('annotation PRD revision lock', () => {
  Object.entries(ANNOTATION_PRD_REVISIONS).forEach(([moduleId, revision]) => {
    test(`${moduleId} 的 PRD 内容未在标注审计后静默变化`, () => {
      const filePath = path.resolve(process.cwd(), revision.path);
      const content = fs.readFileSync(filePath);
      expect(gitBlobSha(content)).toBe(revision.reviewedBlobSha);
    });
  });
});
