import { fmt, totalTokens, type UsageReport, type UsageStage } from '../lib/usage';

const LABEL: Record<UsageStage, string> = {
  brief: 'Brief · Gemini 3.8 Flash',
  avatar: 'Avatar · Nano Banana 2',
  caption: 'Caption · Gemini 3.8 Flash',
  video: 'Video · Gemini Omni',
};

export function TokenSummary({ usage }: { usage: UsageReport }) {
  const rows = (Object.keys(LABEL) as UsageStage[]).filter((k) => usage[k]);
  if (!rows.length) return null;
  return (
    <details className="tokens" open>
      <summary>
        🔢 Tokens used: <b>{fmt(totalTokens(usage))}</b>
      </summary>
      <table>
        <thead>
          <tr>
            <th>Generation</th>
            <th>In</th>
            <th>Out</th>
            <th>Thinking</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((k) => (
            <tr key={k}>
              <td>{LABEL[k]}</td>
              <td>{fmt(usage[k]!.input)}</td>
              <td>{fmt(usage[k]!.output)}</td>
              <td>{fmt(usage[k]!.thinking)}</td>
              <td>
                <b>{fmt(usage[k]!.total)}</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
