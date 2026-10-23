/** How a photo moves through the booth. Labels are the technologies, not a second UI. */
export function ArchDiagram() {
  return (
    <svg className="arch" viewBox="0 0 760 320" role="img" aria-labelledby="arch-title arch-desc">
      <title id="arch-title">Haunted Kiosk architecture</title>
      <desc id="arch-desc">
        The browser uploads a photo to Firebase Storage, asks Firebase AI Logic for a brief and a portrait, then
        asks a Vercel function to start Gemini Omni and poll until the video is saved.
      </desc>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#ffb347" />
        </marker>
      </defs>
      <rect width="760" height="320" rx="16" fill="#120a1c" />
      <Node x={24} y={118} w={120} h={64} title="Photo" sub="1 person or a group" />
      <Node x={180} y={108} w={150} h={84} title="React" sub="Vite or Next.js" accent />
      <Node x={370} y={24} w={170} h={64} title="Firebase Auth" sub="anonymous uid" />
      <Node x={370} y={108} w={170} h={64} title="Firebase Storage" sub="ghouls/{uid}/{job}" />
      <Node x={370} y={192} w={170} h={72} title="Firebase AI Logic" sub="brief + portrait" accent />
      <Node x={180} y={230} w={150} h={64} title="Vercel" sub="two functions" />
      <Node x={580} y={36} w={156} h={56} title="Gemini 3.8 Flash" sub="JSON brief" />
      <Node x={580} y={108} w={156} h={56} title="Nano Banana 2" sub="edit the photo" />
      <Node x={580} y={230} w={156} h={64} title="Gemini Omni" sub="8s video job" />
      <Arrow x1={144} y1={150} x2={180} y2={150} />
      <Arrow x1={330} y1={130} x2={370} y2={56} />
      <Arrow x1={330} y1={150} x2={370} y2={140} />
      <Arrow x1={330} y1={168} x2={370} y2={220} />
      <Arrow x1={255} y1={192} x2={255} y2={230} />
      <Arrow x1={540} y1={210} x2={580} y2={60} />
      <Arrow x1={540} y1={228} x2={580} y2={136} />
      <Arrow x1={330} y1={262} x2={580} y2={262} />
    </svg>
  );
}

function Node({
  x,
  y,
  w,
  h,
  title,
  sub,
  accent,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="12" fill={accent ? '#2a1608' : '#1c1228'} stroke={accent ? '#ff7a1a' : '#3a2452'} />
      <text x={x + 12} y={y + 28} fill="#f4ecff" fontSize="14" fontFamily="Space Grotesk, system-ui, sans-serif" fontWeight="700">
        {title}
      </text>
      <text x={x + 12} y={y + 48} fill="#b7a5cf" fontSize="11" fontFamily="Space Grotesk, system-ui, sans-serif">
        {sub}
      </text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffb347" strokeWidth="1.5" markerEnd="url(#arrow)" />;
}
