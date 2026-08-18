import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  ANNOTATION_PRD_REVISIONS,
  getAnnotationPrdRevisionSources,
} from './annotation-prd-revisions';

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}

describe('annotation PRD revision lock', () => {
  Object.entries(ANNOTATION_PRD_REVISIONS).forEach(([moduleId, revision]) => {
    test(`${moduleId} 的 PRD 内容未在标注审计后静默变化`, () => {
      const sources = getAnnotationPrdRevisionSources(revision);
      expect(sources.length).toBeGreaterThan(0);

      sources.forEach((source) => {
        const filePath = path.resolve(process.cwd(), source.path);
        const content = fs.readFileSync(filePath);
        expect(gitBlobSha(content)).toBe(source.reviewedBlobSha);
      });
    });
  });
});
