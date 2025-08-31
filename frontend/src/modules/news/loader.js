// Vite 전용: 폴더 내 HTML들을 raw 텍스트로 일괄 import
export async function loadLocalArticles() {
  const modules = import.meta.glob('./articles/*.html', { as: 'raw' });
  const entries = await Promise.all(
    Object.entries(modules).map(async ([path, loader]) => ({
      path,
      html: await loader(),
    }))
  );
  // 파일명 기준 정렬 (001, 002, … 순서)
  entries.sort((a, b) => a.path.localeCompare(b.path));
  // 문자열 배열로 반환 (각 원소 = 한 개의 <div> HTML)
  return entries.map((e) => e.html);
}
