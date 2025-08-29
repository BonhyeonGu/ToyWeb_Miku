import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * CyberPanel
 * - Tailwind v4-safe (zinc 팔레트)
 * - 하단 Ticker: 전역 트랙을 기준으로 3개 세그먼트가 ‘창’처럼 같은 선을 보여줌
 *   (각 세그먼트의 track은 같은 transform을 쓰지만, 자기 column offset만큼 시작 오프셋을 더해
 *    세 칸 사이가 정확히 이어져 보이도록 보정)
 */

export default function CyberPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Failed to load status");
      const data = await res.json();
      setStatus(data);
      setErr("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 60_000);
    return () => clearInterval(id);
  }, []);

  const timeLabel = useMemo(() => {
    if (!status?.time) return "--:--";
    try {
      const dt = new Date(status.time);
      const hh = String(dt.getHours()).padStart(2, "0");
      const mm = String(dt.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    } catch {
      return "--:--";
    }
  }, [status]);

  return (
    <div className="min-h-screen w-full bg-[#0c0f14] text-zinc-100 font-mono p-4 md:p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg tracking-[0.2em] text-white/90">World Terminal</span>
          <span className="text-xs text-white/50">pacifica SmartHome_OS 1993</span>
        </div>
        <div className="text-xs text-white/60">HOME ▸ WORLD CUSTOMIZATION ▸ CHANGE LOG</div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left - Quick Menu */}
        <section className="bg-white/5 rounded-2xl p-4 shadow-lg shadow-black/30 ring-1 ring-white/10">
          <PanelHeader title="Quick Menu" subtitle="メニュー" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              "Colliders",
              "Video Player",
              "Ads",
              "Pens",
              "Pickup",
              "Collars",
              "AudioLink",
              "Mood Screens",
            ].map((label) => (
              <NeonButton key={label} label={label} />
            ))}
          </div>

          <div className="mt-4">
            <SectionTitle>Audio Options ・ オーディオ</SectionTitle>
            <div className="h-2 bg-white/10 rounded relative mt-2">
              <div className="absolute left-0 top-0 h-2 w-2/3 bg-cyan-400/80 rounded" />
            </div>
          </div>

          <div className="mt-6">
            <WarningBox>
              THIS WORLD USES FLASHING LIGHTS. VIEWER DISCRETION ADVISED.
            </WarningBox>
          </div>
        </section>

        {/* Center - Supporters */}
        <section className="bg-white/5 rounded-2xl p-4 shadow-lg shadow-black/30 ring-1 ring-white/10">
          <PanelHeader title="Supporters" subtitle="サポーター" />
          <div className="mt-2 space-y-2">
            <SectionTitle>Recent</SectionTitle>
            <div className="flex flex-wrap gap-1 text-xs text-white/80">
              {(status?.supporters?.recent ?? [
                "Illumi",
                "Nagi-san",
                "bread",
                "Lady Faya",
                "Kisne",
                "Moon Foxy",
              ]).map((n) => (
                <span key={n} className="px-2 py-0.5 bg-white/10 rounded border border-white/10">
                  {n}
                </span>
              ))}
            </div>

            <SectionTitle className="mt-4 text-rose-400">Tier 3</SectionTitle>
            <ul className="list-disc ml-5 text-sm text-rose-300/90">
              {(status?.supporters?.tier3 ?? [
                "emmathyst",
                "Kirsi'vali",
                "Humphreaky",
                "WiFiPunk",
                "Cirrus Shark",
              ]).map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <Badge>Discord</Badge>
            <Badge>YouTube</Badge>
            <Badge>VRChat Group</Badge>
            <Badge>Patreon</Badge>
          </div>
        </section>

        {/* Right - Product/Ad */}
        <section className="bg-white/5 rounded-2xl p-0 overflow-hidden shadow-lg shadow-black/30 ring-1 ring-white/10 flex flex-col">
          <div className="p-4">
            <PanelHeader title="Products" subtitle="製品" />
          </div>
          <div className="flex-1 px-4 pb-4 -mt-2">
            <div className="aspect-[4/3] w-full bg-gradient-to-br from-cyan-700/30 to-fuchsia-700/30 rounded-xl ring-1 ring-white/10 flex items-center justify-center">
              <span className="text-white/70 text-sm">AD / PRODUCT IMAGE</span>
            </div>
            <p className="text-center text-xs text-white/70 mt-2">CYBER CRUSH – NOW AVAILABLE</p>
          </div>
        </section>
      </div>

      {/* === Ticker: one global lane, three viewport windows === */}
      <TickerStripWindows
        messages={[
          status?.weather
            ? `${status.location?.city ?? ""} • ${status.weather.cond} ${Math.round(
                status.weather.temp_c
              )}°C`
            : "WEATHER SYNCING…",
          `TIME ${timeLabel}`,
          ...(status?.supporters?.recent ?? [
            "Illumi",
            "Nagi-san",
            "bread",
            "Lady Faya",
            "Kisne",
            "Moon Foxy",
          ]).map((n) => `THANKS, ${n}`),
          "JOIN THE GROUP → GLITCH.8936",
        ]}
        speed={40} // px/sec
      />

      {/* Bottom status bar */}
      <footer className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-white/5 rounded-xl px-3 py-2 ring-1 ring-white/10 flex items-center gap-3">
          <span className="text-2xl font-bold tracking-widest tabular-nums">{timeLabel}</span>
          <div className="h-4 w-px bg-white/20" />
          {status?.weather ? (
            <div className="flex items-center gap-2">
              {status.weather.icon && <img src={status.weather.icon} alt="cond" className="h-5 w-5" />}
              <span>{status.weather.cond}</span>
              <span className="font-bold">{Math.round(status.weather.temp_c)}°C</span>
            </div>
          ) : (
            <span className="text-white/50">Weather — loading…</span>
          )}
          <div className="ml-auto text-white/50">
            {status?.location ? `${status.location.city}, ${status.location.country}` : ""}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl px-3 py-2 ring-1 ring-white/10 text-white/70">
          JOIN THE GROUP → GLITCH.8936
        </div>

        <div className="bg-white/5 rounded-xl px-3 py-2 ring-1 ring-white/10 text-right text-white/60">
          {loading ? "SYNCING…" : err ? `ERROR: ${err}` : "OK"}
        </div>
      </footer>
    </div>
  );
}

/* ---------- Parts ---------- */

function PanelHeader({ title, subtitle }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-lg font-semibold tracking-widest text-white/90">{title}</h2>
      <span className="text-xs text-white/50">{subtitle}</span>
    </div>
  );
}

function SectionTitle({ children, className = "" }) {
  return <h3 className={`text-sm tracking-widest text-white/70 ${className}`}>{children}</h3>;
}

function NeonButton({ label }) {
  return (
    <button className="relative w-full py-2 px-3 text-left text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition group overflow-hidden">
      <span className="relative z-10">{label}</span>
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-fuchsia-600/10 via-cyan-400/10 to-transparent" />
    </button>
  );
}

function WarningBox({ children }) {
  return (
    <div className="text-[10px] leading-4 tracking-wider bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 rounded-lg p-3">
      ⚠️ {children}
    </div>
  );
}

function Badge({ children }) {
  return <div className="border border-white/15 rounded-md px-2 py-1 text-center bg-white/5">{children}</div>;
}

/* ---------- Ticker: One global lane + 3 viewport windows ---------- */

/**
 * 핵심:
 *  - loopLen = 메시지 한번(중복 없이) 렌더링했을 때 실제 너비(px)
 *  - 전역 위치 dist = (t * speed) % loopLen
 *  - 각 칸의 track transform = translateX( - (dist + colOffset[i]) )
 *    → colOffset = 해당 칸의 "창"이 컨테이너 왼쪽으로부터 떨어진 px(반응형일 때도 갱신)
 *    → 이렇게 하면 3칸이 정확히 이어진 “한 줄”처럼 보인다.
 */
/* ---------- Ticker: One global lane + 3 viewport windows (circular DOM) ---------- */
/**
 * 전략
 *  - 각 세그먼트 트랙에 메시지 span들을 5회 정도 렌더(버퍼 충분)
 *  - rAF로 offsetPx를 증가시키며 translateX 적용
 *  - offsetPx가 "첫 요소 폭 + gap"을 넘으면:
 *      - offsetPx -= 그 폭
 *      - 각 트랙에서 첫 요소를 .appendChild(...)로 맨 뒤로 이동 (원형 큐)
 *  - 세그먼트별 왼쪽 오프셋(offsets[i])만큼 추가로 평행 이동 → 세 칸이 한 줄처럼 이어져 보임
 */
function TickerStripWindows({ messages = [], speed = 40 }) {
  const containerRef = React.useRef(null);
  const windowRefs = [React.useRef(null), React.useRef(null), React.useRef(null)];
  const trackRefs  = [React.useRef(null), React.useRef(null), React.useRef(null)];

  // 각 창의 컨테이너 기준 left px (반응형 대응)
  const [offsets, setOffsets] = React.useState([0, 0, 0]);

  const GAP = 48;          // px, 아이템 간 간격
  const REPEATS = 5;       // 초기 렌더 반복 횟수 (충분히 크게)
  const MIN_STEP = 1 / 60; // s, 너무 빠른 rAF에서 dist 불안정 방지용

  // 1) 각 창의 left offset을 추적
  React.useEffect(() => {
    const updateOffsets = () => {
      const baseLeft = containerRef.current?.getBoundingClientRect().left ?? 0;
      setOffsets(windowRefs.map(r => {
        const rect = r.current?.getBoundingClientRect();
        return rect ? Math.max(0, Math.round(rect.left - baseLeft)) : 0;
      }));
    };
    updateOffsets();

    const ro = new ResizeObserver(updateOffsets);
    windowRefs.forEach(r => r.current && ro.observe(r.current));
    window.addEventListener("resize", updateOffsets);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateOffsets);
    };
  }, []);

  // 2) 초기 DOM 구성: 각 트랙에 span들을 REPEATS 번 렌더해 두기
  //    (React로 렌더 + 이후에는 DOM을 직접 회전시킴)
  const RenderItems = () => (
    <>
      {Array.from({ length: REPEATS }).map((_, rep) =>
        messages.length === 0 ? (
          <span key={`rep-${rep}-loading`} className="text-white/60 text-xs">LOADING…</span>
        ) : (
          messages.map((m, i) => (
            <span key={`rep-${rep}-${i}`} className="text-xs text-white/80">{m}</span>
          ))
        )
      )}
    </>
  );

  // 3) rAF 타임라인: offsetPx 증가 + 임계 통과 시 첫 요소를 뒤로 이동
  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let offsetPx = 0;        // 전역 이동량(px)
    let threshold = 0;       // "첫 요소 폭 + GAP" (동적으로 갱신)

    // threshold를 현재 첫 요소 기준으로 갱신
    const refreshThreshold = () => {
      // 첫 요소(세 창 모두 동일한 구조이므로 첫 번째 트랙 기준으로 측정)
      const firstTrack = trackRefs[0].current;
      if (!firstTrack || !firstTrack.firstElementChild) return;
      const firstEl = firstTrack.firstElementChild;
      const w = firstEl.getBoundingClientRect().width;
      threshold = Math.max(1, Math.round(w + GAP));
    };

    // 첫 요소를 뒤로 보내기 (세 트랙 모두 동일하게)
    const rotateOnce = () => {
      for (const tRef of trackRefs) {
        const t = tRef.current;
        if (!t || !t.firstElementChild) continue;
        t.appendChild(t.firstElementChild);
      }
      refreshThreshold(); // 다음 첫 요소 기준으로 문턱 갱신
    };

    refreshThreshold();

    const step = (now) => {
      const dt = Math.max(MIN_STEP, (now - last) / 1000); // s
      last = now;

      // 전역 이동량 업데이트
      offsetPx += dt * speed;

      // 임계 통과: 앞 요소를 뒤로 붙이며 offset 보정
      while (threshold > 0 && offsetPx >= threshold) {
        offsetPx -= threshold;
        rotateOnce();
      }

      // 세 창 각각에 동일한 전역 offset에 창의 left 오프셋만큼 더해 적용
      const baseTx = -offsetPx;
      for (let i = 0; i < trackRefs.length; i++) {
        const node = trackRefs[i].current;
        if (!node) continue;
        node.style.transform = `translate3d(${baseTx - (offsets[i] || 0)}px,0,0)`;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [messages.join("|"), offsets[0], offsets[1], offsets[2]]);

  return (
    <div ref={containerRef} className="relative my-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0,1,2].map((i) => (
          <div
            key={i}
            ref={windowRefs[i]}
            className="overflow-hidden rounded-xl ring-1 ring-white/10 bg-white/5 py-1"
          >
            <div
              ref={trackRefs[i]}
              className="flex items-center whitespace-nowrap will-change-transform"
              style={{ gap: `${GAP}px`, transform: "translate3d(0,0,0)" }}
            >
              <RenderItems />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- optional: GPU 합성 힌트 (대부분 최신 브라우저는 불필요) --- */
// (원하면 body에 will-change 추가 등 가능)
