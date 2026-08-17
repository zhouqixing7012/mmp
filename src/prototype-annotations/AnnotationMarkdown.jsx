import React from 'react';

function renderInlineMarkdown(text) {
  const parts = String(text || '').split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${part}-${index}`} style={{ background: '#f5f5f5', padding: '0 4px', borderRadius: 3, fontSize: '0.95em' }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

function splitTableCells(line) {
  return String(line || '')
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableDivider(line) {
  const cells = splitTableCells(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isTableStart(lines, index) {
  return Boolean(lines[index]?.includes('|') && lines[index + 1]?.includes('|') && isTableDivider(lines[index + 1]));
}

function isBlockStart(lines, index) {
  const line = lines[index] || '';
  return isTableStart(lines, index)
    || /^\s*#{1,4}\s+/.test(line)
    || /^\s*[-*]\s+/.test(line)
    || /^\s*\d+\.\s+/.test(line);
}

export function hasBlockMarkdown(text) {
  const lines = String(text || '').split('\n');
  return lines.some((line, index) => isBlockStart(lines, index));
}

export function AnnotationInlineMarkdown({ text }) {
  return <>{renderInlineMarkdown(text)}</>;
}

export default function AnnotationMarkdown({ text }) {
  const lines = String(text || '').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const headers = splitTableCells(lines[index]);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableCells(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={`table-${index}`} style={{ overflowX: 'auto', margin: '6px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {headers.map((header, headerIndex) => (
                  <th key={`${header}-${headerIndex}`} style={{ textAlign: 'left', padding: '5px 7px', background: '#fafafa', border: '1px solid #e8e8e8', fontWeight: 600 }}>
                    {renderInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {headers.map((_, cellIndex) => (
                    <td key={`cell-${rowIndex}-${cellIndex}`} style={{ padding: '5px 7px', border: '1px solid #e8e8e8', verticalAlign: 'top' }}>
                      {renderInlineMarkdown(row[cellIndex] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const headingMatch = line.match(/^\s*(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push(
        <div key={`heading-${index}`} style={{ fontWeight: 600, margin: '6px 0 4px', fontSize: headingMatch[1].length === 1 ? 14 : 13 }}>
          {renderInlineMarkdown(headingMatch[2])}
        </div>
      );
      index += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${index}`} style={{ margin: '4px 0 4px 18px', padding: 0 }}>
          {items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>)}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${index}`} style={{ margin: '4px 0 4px 20px', padding: 0 }}>
          {items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>)}
        </ol>
      );
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <div key={`paragraph-${index}`} style={{ margin: '2px 0' }}>
        {paragraphLines.map((paragraphLine, lineIndex) => (
          <React.Fragment key={`${paragraphLine}-${lineIndex}`}>
            {lineIndex > 0 && <br />}
            {renderInlineMarkdown(paragraphLine)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return <>{blocks}</>;
}
