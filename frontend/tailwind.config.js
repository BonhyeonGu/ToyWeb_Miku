/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    // 뉴스 기사 HTML도 스캔 대상에 포함(클래스 purge 방지)
    "./src/modules/news/articles/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Tailwind 유틸로도 쓰고 싶을 때: className="font-korean"
        korean: ["var(--font-korean)"],
        "korean-mono": ["var(--font-korean-mono)"],
      },
    },
  },
  plugins: [],
}
