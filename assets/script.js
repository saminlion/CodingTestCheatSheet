const contentArea = document.getElementById("content-area");
const langButtons = document.querySelectorAll("#language-tabs button");
let currentLang = "cs";

// 언어 탭 클릭 이벤트
langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    langButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentLang = btn.dataset.lang;
    loadSections();
  });
});

// 섹션 로딩
async function loadSections() {
  let sections;
  try {
    const response = await fetch("content/sections.json");
    if (!response.ok) throw new Error("sections.json 로드 실패");
    sections = await response.json();
  } catch (error) {
    contentArea.innerHTML = `<p style="color:red;"><strong>❌ 섹션 정보를 불러오는 중 오류 발생:</strong> ${error.message}</p>`;
    console.error("섹션 로딩 실패:", error);
    return;
  }

  for (const section of sections) {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "section";

    // ✅ <h2>는 <details> 밖
    const h2 = document.createElement("h2");
    h2.textContent = `■ ${section.title}`;
    sectionDiv.appendChild(h2);

    const summary = document.createElement("summary");
    summary.innerHTML = `<h2>■ ${section.title}</h2>`;

    const details = document.createElement("details");
    details.setAttribute("close", "");

    // fetch 콘텐츠
    const [description, patternDesc, problemDesc, codeContent, exampleCode, exampleIO] = await Promise.all([
      fetchText(`content/sections/${section.id}/description.html`),
      fetchText(`content/sections/${section.id}/pattern-desc.html`),
      fetchText(`content/sections/${section.id}/problem-desc.html`),
      fetchText(`content/sections/${section.id}/${currentLang}.code.html`),
      fetchText(`content/sections/${section.id}/${currentLang}.example.html`),
      fetchText(`content/sections/${section.id}/example-io.html`),
    ]);

    // 코드 패턴 영역 구성
    const codeBlock = `
      <div class="foldable">
        <button class="toggle-btn" onclick="toggleSection(this)">
          <p><strong>[사용 코드(패턴)] 보기/접기기</strong></p>
        </button>
        <div class="fold-content">
          <pre><code class="language-${currentLang}">

${escapeHTML(codeContent)}
</pre></code>
        </div>
      </div>`;

    // 예시 문제 영역 구성
    const exampleBlock = `
      ${patternDesc}
      <div class="foldable">
        <button class="toggle-btn" onclick="toggleSection(this)">
<p><strong>[예시 문제]</strong><br></p>
        </button>
        <div class="fold-content">
              ${problemDesc}

                  <pre><code class="language-${currentLang}">
${escapeHTML(exampleCode)}
</pre></code>

          ${exampleIO}
        </div>
      </div>`;

    // fetch 후 조립
    details.insertAdjacentHTML("beforeend", description);
    details.insertAdjacentHTML("beforeend", codeBlock);
    details.insertAdjacentHTML("beforeend", exampleBlock);

    sectionDiv.appendChild(details);
    contentArea.appendChild(sectionDiv);
  }

  hljs.highlightAll();
  closeAllFoldables();
}

// 텍스트 파일 fetch
async function fetchText(path) {
  try {
    const res = await fetch(path);
    return res.ok ? await res.text() : `<p>파일 불러오기 실패: ${path}</p>`;
  } catch {
    return `<p>파일 불러오기 오류: ${path}</p>`;
  }
}

// HTML escape
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 접기 초기화
function closeAllFoldables() {
  document.querySelectorAll(".fold-content").forEach((el) => {
    el.style.display = "none";
  });
}

// 접기 버튼 동작
function toggleSection(button) {
  const content = button.nextElementSibling;
  content.style.display = content.style.display === "none" ? "block" : "none";
}

// 초기 로딩
document.addEventListener("DOMContentLoaded", loadSections);