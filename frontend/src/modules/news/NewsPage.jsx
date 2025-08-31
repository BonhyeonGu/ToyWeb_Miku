import React from "react";

export default function NewsPage({
  items = [],
  initialIndex = 0,
  onIndexChange,
  className = "",
  heightClass = "h-96 md:h-[32rem]",
  autoAdvanceMs
}) {
  const [idx, setIdx] = React.useState(
    Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0))
  );
  const wrap = (n) => (items.length ? (n + items.length) % items.length : 0);

  const goPrev = React.useCallback(() => {
    const next = wrap(idx - 1);
    setIdx(next);
    onIndexChange?.(next);
  }, [idx, items.length]);

  const goNext = React.useCallback(() => {
    const next = wrap(idx + 1);
    setIdx(next);
    onIndexChange?.(next);
  }, [idx, items.length]);

  const rootRef = React.useRef(null);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // 전환 keyframes + 기사 리셋 스타일
  React.useEffect(() => {
    if (!document.getElementById("newsfade-keyframes")) {
      const st = document.createElement("style");
      st.id = "newsfade-keyframes";
      st.innerHTML = `
        @keyframes newsfade {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(st);
    }
    if (!document.getElementById("newspage-strong-reset")) {
      const st2 = document.createElement("style");
      st2.id = "newspage-strong-reset";
      st2.innerHTML = `
        .news-content, .news-content * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box;
        }
        .news-content { line-height: 1.6; color: rgba(255,255,255,0.85); }
        .news-content h1,.news-content h2,.news-content h3,
        .news-content h4,.news-content h5,.news-content h6 { font-weight: 600; }
        .news-content > * + * { margin-top: 0.5rem !important; }
        .news-content ul, .news-content ol { padding-left: 1rem !important; }
        .news-content li > * + * { margin-top: 0.25rem !important; }
        .news-content hr { border:0; height:1px; background:rgba(255,255,255,0.12); margin:0.5rem 0 !important; }
        .news-content img, .news-content video { display:block; max-width:100%; height:auto; margin:0.5rem 0 !important; }
        .news-content > :first-child { margin-top: 0 !important; }
        .news-content > :last-child  { margin-bottom: 0 !important; }
        .news-content br { line-height: 0; }
        .news-content br + br { display: none; }
      `;
      document.head.appendChild(st2);
    }
  }, []);

  // 본문 정규화
  const normalizeHtml = React.useCallback((html) => {
    if (typeof html !== "string") return html;
    let s = html;
    s = s.replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br>");
    s = s.replace(/(?:&nbsp;\s*){2,}/gi, "&nbsp;");
    s = s.replace(/\n{2,}/g, "\n");
    return s.trim();
  }, []);

  const rawCurrent = items[idx];
  const normalized = typeof rawCurrent === "string" ? normalizeHtml(rawCurrent) : rawCurrent;

  // 🔼 자동 넘김 타이머
  React.useEffect(() => {
    if (!autoAdvanceMs || items.length <= 1) return;
    const id = setInterval(goNext, autoAdvanceMs);
    return () => clearInterval(id);
  }, [goNext, autoAdvanceMs, items.length]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={`outline-none select-none flex flex-col ${heightClass} ${className}`}
      aria-label="News Page"
    >
      {/* 상단 컨트롤 바 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="text-xs text-white/60">
          {items.length ? `Page ${idx + 1} / ${items.length}` : "No articles"}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={goPrev}
            className="px-2.5 py-1 rounded-md text-xs border border-white/15 bg-white/5 hover:bg-white/10 active:bg-white/15"
          >
            ◀ Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            className="px-2.5 py-1 rounded-md text-xs border border-white/15 bg-white/5 hover:bg-white/10 active:bg-white/15"
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="relative flex-1 min-h-0 overflow-auto">
        <div
          key={idx}
          className="news-content text-sm whitespace-normal animate-[newsfade_180ms_ease-out]"
          dangerouslySetInnerHTML={
            typeof normalized === "string" ? { __html: normalized } : undefined
          }
        >
          {typeof normalized !== "string" ? normalized : null}
        </div>
      </div>
    </div>
  );
}
