import type { Locale } from './i18n';
import type { ArithmeticQuestion } from './api';

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8') {
  downloadBlob(filename, new Blob([text], { type: mime }));
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function makeWorksheetHtml(params: {
  locale: Locale;
  title: string;
  subtitle?: string;
  questions: ArithmeticQuestion[];
  showAnswers: boolean;
  includeMeta: boolean;
}) {
  const { locale, title, subtitle, questions, showAnswers, includeMeta } = params;

  const labels =
    locale === 'zh-CN'
      ? { answer: '答案', worksheet: '练习卷', answerSheet: '答案页' }
      : { answer: 'Answer', worksheet: 'Worksheet', answerSheet: 'Answer Key' };

  const rows = questions
    .map((q, idx) => {
      const meta = includeMeta ? `<div class="meta">${escapeHtml(q.knowledgePointId)}</div>` : '';
      const ans = showAnswers ? `<div class="ans">${labels.answer}: ${q.answer}</div>` : '';
      return `<div class="q">
  <div class="left">
    <div class="stem">${idx + 1}. ${escapeHtml(q.stem)}</div>
    ${meta}
  </div>
  ${ans}
</div>`;
    })
    .join('\n');

  const answerRows = questions
    .map((q, idx) => `<div class="ak-item">${idx + 1}. ${q.answer}</div>`)
    .join('\n');

  const safeTitle = escapeHtml(title);
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : '';

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <style>
      :root {
        --bg: #f2f2f7;
        --card: #ffffff;
        --text: #111827;
        --muted: #6b7280;
        --border: #e5e7eb;
        --shadow: 0 10px 30px rgba(0,0,0,.08);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        color: var(--text);
        background: var(--bg);
      }
      .wrap { max-width: 900px; margin: 0 auto; padding: 24px; }
      .header { display: grid; gap: 6px; margin-bottom: 16px; }
      .title { font-weight: 800; font-size: 22px; letter-spacing: .2px; }
      .subtitle { color: var(--muted); font-size: 12px; }
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 18px;
        box-shadow: var(--shadow);
        padding: 16px;
      }
      .q {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 12px;
        border: 1px solid var(--border);
        border-radius: 14px;
        margin-bottom: 10px;
      }
      .stem { font-weight: 650; }
      .meta { margin-top: 4px; color: var(--muted); font-size: 12px; }
      .ans { white-space: nowrap; color: var(--muted); font-size: 12px; padding-top: 2px; }
      .ak {
        margin-top: 16px;
        border-top: 1px dashed var(--border);
        padding-top: 16px;
      }
      .ak-title { font-weight: 750; margin-bottom: 10px; }
      .ak-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
      .ak-item { padding: 6px 8px; border: 1px solid var(--border); border-radius: 12px; text-align: center; background: #fff; }

      @media print {
        body { background: #fff; }
        .wrap { padding: 0; max-width: none; }
        .card { border: none; box-shadow: none; padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <div class="title">${safeTitle}</div>
        ${safeSubtitle ? `<div class="subtitle">${safeSubtitle}</div>` : ''}
      </div>
      <div class="card">
        <div class="subtitle">${labels.worksheet}</div>
        <div style="height: 8px"></div>
        ${rows}
        <div class="ak">
          <div class="ak-title">${labels.answerSheet}</div>
          <div class="ak-grid">
            ${answerRows}
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function exportAsJson(params: { filename: string; data: unknown }) {
  downloadText(params.filename, JSON.stringify(params.data, null, 2), 'application/json;charset=utf-8');
}

export function exportAsCsv(params: { filename: string; questions: ArithmeticQuestion[] }) {
  const header = ['id', 'stem', 'answer', 'knowledgePointId', 'grade', 'operator', 'a', 'b'];
  const lines = [header.join(',')];
  for (const q of params.questions) {
    const [a, b] = q.operands;
    const row = [
      q.id,
      q.stem,
      String(q.answer),
      q.knowledgePointId,
      String(q.grade),
      q.operator,
      String(a),
      String(b)
    ].map(v => `"${String(v).replaceAll('"', '""')}"`);
    lines.push(row.join(','));
  }
  downloadText(params.filename, lines.join('\n'), 'text/csv;charset=utf-8');
}

export function exportAsHtml(params: { filename: string; html: string }) {
  downloadText(params.filename, params.html, 'text/html;charset=utf-8');
}

export function openPrintPreview(html: string) {
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
}

