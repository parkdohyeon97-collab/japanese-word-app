const CHAPTER_SIZE = 50;
const ANNOYING_LIMIT = 8;
const USER_ITEMS_KEY = "jpAppItemsV5";
const WRONG_COUNTS_KEY = "jpAppWrongCountsV5";

const defaultWords = [
  { id: "word-1", word: "腕", reading: "うで", meaning: "팔" },
  { id: "word-2", word: "運賃", reading: "うんちん", meaning: "운임" },
  { id: "word-3", word: "介護", reading: "かいご", meaning: "돌봄, 간호" },
  { id: "word-4", word: "拡充", reading: "かくじゅう", meaning: "확충" },
  { id: "word-5", word: "肩", reading: "かた", meaning: "어깨" },
  { id: "word-6", word: "警備", reading: "けいび", meaning: "경비" },
  { id: "word-7", word: "削除", reading: "さくじょ", meaning: "삭제" },
  { id: "word-8", word: "実践", reading: "じっせん", meaning: "실천" },
  { id: "word-9", word: "世間", reading: "せけん", meaning: "세상, 사회" },
  { id: "word-10", word: "素材", reading: "そざい", meaning: "소재" },
  { id: "word-11", word: "破片", reading: "はへん", meaning: "파편" },
  { id: "word-12", word: "分析", reading: "ぶんせき", meaning: "분석" },
  { id: "word-13", word: "模範", reading: "もはん", meaning: "모범" },
  { id: "word-14", word: "迷う", reading: "まよう", meaning: "헤매다, 망설이다" },
  { id: "word-15", word: "傾く", reading: "かたむく", meaning: "기울다" },
  { id: "word-16", word: "詰まる", reading: "つまる", meaning: "막히다" },
  { id: "word-17", word: "定める", reading: "さだめる", meaning: "정하다" },
  { id: "word-18", word: "焦る", reading: "あせる", meaning: "초조해하다, 서두르다" },
  { id: "word-19", word: "荒れる", reading: "あれる", meaning: "거칠어지다" },
  { id: "word-20", word: "敗れる", reading: "やぶれる", meaning: "지다, 패배하다" },
  { id: "word-21", word: "賢い", reading: "かしこい", meaning: "현명하다, 영리하다" },
  { id: "word-22", word: "辛い", reading: "からい", meaning: "맵다" },
  { id: "word-23", word: "鋭い", reading: "するどい", meaning: "날카롭다, 예리하다" },
  { id: "word-24", word: "厚かましい", reading: "あつかましい", meaning: "뻔뻔스럽다" },
  { id: "word-25", word: "乏しい", reading: "とぼしい", meaning: "부족하다, 빈약하다" },
  { id: "word-26", word: "激しい", reading: "はげしい", meaning: "격렬하다, 심하다" },
  { id: "word-27", word: "勇ましい", reading: "いさましい", meaning: "용맹하다, 씩씩하다" },
  { id: "word-28", word: "恐ろしい", reading: "おそろしい", meaning: "무섭다, 두렵다" },
  { id: "word-29", word: "鮮やかだ", reading: "あざやかだ", meaning: "선명하다, 산뜻하다" },
  { id: "word-30", word: "穏やかだ", reading: "おだやかだ", meaning: "온화하다, 평온하다" },
  { id: "word-31", word: "握手", reading: "あくしゅ", meaning: "악수" },
  { id: "word-32", word: "衣装", reading: "いしょう", meaning: "의상" },
  { id: "word-33", word: "幹事", reading: "かんじ", meaning: "모임의 총무, 간사" },
  { id: "word-34", word: "起床", reading: "きしょう", meaning: "기상, 잠자리에서 일어남" },
  { id: "word-35", word: "刑事", reading: "けいじ", meaning: "형사" },
  { id: "word-36", word: "検事", reading: "けんじ", meaning: "검사" },
  { id: "word-37", word: "腰", reading: "こし", meaning: "허리" },
  { id: "word-38", word: "才能", reading: "さいのう", meaning: "재능" },
  { id: "word-39", word: "賛否", reading: "さんぴ", meaning: "찬반, 찬성과 반대" },
  { id: "word-40", word: "情景", reading: "じょうけい", meaning: "정경, 광경" },
  { id: "word-41", word: "声援", reading: "せいえん", meaning: "성원, 응원" },
  { id: "word-42", word: "背骨", reading: "せぼね", meaning: "등뼈, 척추" },
  { id: "word-43", word: "善良", reading: "ぜんりょう", meaning: "선량함, 착함" },
  { id: "word-44", word: "途端", reading: "とたん", meaning: "~하자마자, 바로 그 순간" },
  { id: "word-45", word: "農薬", reading: "のうやく", meaning: "농약" },
  { id: "word-46", word: "膝", reading: "ひざ", meaning: "무릎" },
  { id: "word-47", word: "分解", reading: "ぶんかい", meaning: "분해" },
  { id: "word-48", word: "疑う", reading: "うたがう", meaning: "의심하다" },
  { id: "word-49", word: "収まる", reading: "おさまる", meaning: "진정되다, 가라앉다" },
  { id: "word-50", word: "絡まる", reading: "からまる", meaning: "얽히다, 휘감기다" }
];

const CATEGORY_NAMES = {
  word: "단어",
  grammar: "문법",
  conversation: "회화",
  review: "N5~N3 추가단어"
};

const screens = {
  home: document.getElementById("homeScreen"),
  chapter: document.getElementById("chapterScreen"),
  add: document.getElementById("addScreen"),
  study: document.getElementById("studyScreen"),
  complete: document.getElementById("completeScreen"),
  annoying: document.getElementById("annoyingScreen"),
  search: document.getElementById("searchScreen"),
  random: document.getElementById("randomScreen")
};

const categoryTitle = document.getElementById("categoryTitle");
const categoryTotalCount = document.getElementById("categoryTotalCount");
const chapterList = document.getElementById("chapterList");
const wordCategoryCount = document.getElementById("wordCategoryCount");
const grammarCategoryCount = document.getElementById("grammarCategoryCount");
const conversationCategoryCount = document.getElementById("conversationCategoryCount");
const reviewCategoryCount = document.getElementById("reviewCategoryCount");
const annoyingMenuCount = document.getElementById("annoyingMenuCount");
const openSearchButton = document.getElementById("openSearchButton");
const closeSearchButton = document.getElementById("closeSearchButton");
const searchInput = document.getElementById("searchInput");
const clearSearchButton = document.getElementById("clearSearchButton");
const searchSummary = document.getElementById("searchSummary");
const searchResultList = document.getElementById("searchResultList");

const openRandomButton = document.getElementById("openRandomButton");
const closeRandomButton = document.getElementById("closeRandomButton");
const randomWordCount = document.getElementById("randomWordCount");
const randomReviewCount = document.getElementById("randomReviewCount");
const randomCountPanel = document.getElementById("randomCountPanel");
const randomSelectedTitle = document.getElementById("randomSelectedTitle");
const randomCountHelp = document.getElementById("randomCountHelp");

const closeChapterButton = document.getElementById("closeChapterButton");
const openAddButton = document.getElementById("openAddButton");
const closeAddButton = document.getElementById("closeAddButton");
const addTitle = document.getElementById("addTitle");
const singleTabButton = document.getElementById("singleTabButton");
const bulkTabButton = document.getElementById("bulkTabButton");
const singleForm = document.getElementById("singleForm");
const bulkPanel = document.getElementById("bulkPanel");
const wordInput = document.getElementById("wordInput");
const readingInput = document.getElementById("readingInput");
const meaningInput = document.getElementById("meaningInput");
const bulkInput = document.getElementById("bulkInput");
const saveBulkButton = document.getElementById("saveBulkButton");
const recentWordList = document.getElementById("recentWordList");

const studyTitle = document.getElementById("studyTitle");
const currentNumber = document.getElementById("currentNumber");
const totalNumber = document.getElementById("totalNumber");
const wordElement = document.getElementById("word");
const answerElement = document.getElementById("answer");
const readingElement = document.getElementById("reading");
const meaningElement = document.getElementById("meaning");
const wrongCountBadge = document.getElementById("wrongCountBadge");
const soundTouchArea = document.getElementById("soundTouchArea");
const soundButton = document.getElementById("soundButton");
const meaningButton = document.getElementById("meaningButton");
const studyAgainButton = document.getElementById("studyAgainButton");
const knowButton = document.getElementById("knowButton");
const exitStudyButton = document.getElementById("exitStudyButton");
const closeStudyButton = document.getElementById("closeStudyButton");

const completeTitle = document.getElementById("completeTitle");
const completeMessage = document.getElementById("completeMessage");
const completeHomeButton = document.getElementById("completeHomeButton");

const openAnnoyingButton = document.getElementById("openAnnoyingButton");
const closeAnnoyingButton = document.getElementById("closeAnnoyingButton");
const studyAnnoyingButton = document.getElementById("studyAnnoyingButton");
const annoyingWordList = document.getElementById("annoyingWordList");

let currentCategory = "word";
let studyMode = "chapter";
let selectedChapter = 1;
let roundNumber = 1;
let currentIndex = 0;
let currentItems = [];
let nextRoundItems = [];
let randomCategory = "word";
let randomRequestedCount = 50;

function loadJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); }
  catch { return fallback; }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUserItems() {
  const data = loadJson(USER_ITEMS_KEY, []);
  return Array.isArray(data) ? data : [];
}

function saveUserItems(items) {
  saveJson(USER_ITEMS_KEY, items);
}

function getWrongCounts() {
  const data = loadJson(WRONG_COUNTS_KEY, {});
  return data && typeof data === "object" ? data : {};
}

function saveWrongCounts(counts) {
  saveJson(WRONG_COUNTS_KEY, counts);
}

function getAllItems() {
  const baseWords = defaultWords.map(item => ({ ...item, category: "word" }));
  const userItems = getUserItems().map(item => ({
    ...item,
    category: item.category || "word"
  }));
  return [...baseWords, ...userItems];
}

function getCategoryItems(category) {
  return getAllItems().filter(item => item.category === category);
}

function getWrongCount(id) {
  return Number(getWrongCounts()[id] || 0);
}

function increaseWrongCount(id) {
  const counts = getWrongCounts();
  counts[id] = Number(counts[id] || 0) + 1;
  saveWrongCounts(counts);
}

function getAnnoyingItems(category = currentCategory) {
  return getCategoryItems(category)
    .filter(item => getWrongCount(item.id) >= ANNOYING_LIMIT)
    .sort((a, b) => getWrongCount(b.id) - getWrongCount(a.id));
}

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.hidden = true);
  screens[name].hidden = false;
  window.scrollTo(0, 0);
}

function renderHome() {
  wordCategoryCount.textContent = `${getCategoryItems("word").length}개`;
  grammarCategoryCount.textContent = `${getCategoryItems("grammar").length}개`;
  conversationCategoryCount.textContent = `${getCategoryItems("conversation").length}개`;
  reviewCategoryCount.textContent = `${getCategoryItems("review").length}개`;
  randomWordCount.textContent = `${getCategoryItems("word").length}개 등록`;
  randomReviewCount.textContent = `${getCategoryItems("review").length}개 등록`;
}

function renderChapterScreen() {
  const items = getCategoryItems(currentCategory);
  const categoryName = CATEGORY_NAMES[currentCategory];

  categoryTitle.textContent = categoryName;
  categoryTotalCount.textContent = items.length;
  annoyingMenuCount.textContent = `${getAnnoyingItems().length}개`;

  chapterList.innerHTML = "";

  if (items.length === 0) {
    chapterList.innerHTML = `
      <div class="empty-box">
        아직 등록된 ${categoryName}가 없습니다.<br>
        오른쪽 위 ＋ 버튼으로 추가해 주세요.
      </div>
    `;
    return;
  }

  const chapterCount = Math.ceil(items.length / CHAPTER_SIZE);

  for (let chapter = 1; chapter <= chapterCount; chapter += 1) {
    const blockStart = Math.floor((chapter - 1) / 4) * 200;
    const end = Math.min(chapter * CHAPTER_SIZE, items.length);
    const newStart = (chapter - 1) * CHAPTER_SIZE + 1;
    const studyStart = blockStart + 1;
    const studyCount = end - blockStart;

    const card = document.createElement("button");
    card.type = "button";
    card.className = "chapter-card";
    card.innerHTML = `
      <span class="chapter-name">제 ${chapter}장</span>
      <strong>${studyStart} ~ ${end}</strong>
      <small>새 항목 ${newStart}~${end}<br>이번 묶음 ${studyCount}개 누적 학습</small>
    `;
    card.addEventListener("click", () => startChapter(chapter));
    chapterList.appendChild(card);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeId() {
  return "user-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function normalizeDuplicateText(value) {
  return String(value || "").normalize("NFKC").trim().replace(/[\s　]+/g, "").toLocaleLowerCase("ja");
}

function isDuplicate(word, list = getCategoryItems(currentCategory)) {
  const target = normalizeDuplicateText(word);
  return list.some(item => normalizeDuplicateText(item.word) === target);
}

function removeSavedDuplicates() {
  const userItems = getUserItems();
  const seen = new Set(defaultWords.map(item => `word::${normalizeDuplicateText(item.word)}`));
  const cleaned = [];
  let removed = 0;
  userItems.forEach(item => {
    const category = item.category || "word";
    const key = `${category}::${normalizeDuplicateText(item.word)}`;
    if (!normalizeDuplicateText(item.word) || seen.has(key)) { removed += 1; return; }
    seen.add(key); cleaned.push(item);
  });
  if (removed > 0) saveUserItems(cleaned);
  return removed;
}

function renderRecentItems() {
  const items = getUserItems().filter(item => (item.category || "word") === currentCategory);
  recentWordList.innerHTML = "";

  if (items.length === 0) {
    recentWordList.innerHTML = '<div class="empty-box">직접 추가한 항목이 아직 없습니다.</div>';
    return;
  }

  [...items].reverse().slice(0, 30).forEach(item => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.word)}</strong>
        <span>${escapeHtml(item.reading)} · ${escapeHtml(item.meaning)}</span>
      </div>
      <button type="button" data-id="${item.id}">삭제</button>
    `;
    row.querySelector("button").addEventListener("click", () => deleteItem(item.id));
    recentWordList.appendChild(row);
  });
}

function deleteItem(id) {
  if (!confirm("이 항목을 삭제할까요?")) return;

  saveUserItems(getUserItems().filter(item => item.id !== id));

  const counts = getWrongCounts();
  delete counts[id];
  saveWrongCounts(counts);

  renderRecentItems();
  renderChapterScreen();
  renderHome();
}

singleForm.addEventListener("submit", event => {
  event.preventDefault();

  const word = wordInput.value.trim();
  const reading = readingInput.value.trim();
  const meaning = meaningInput.value.trim();

  if (!word || !reading || !meaning) return;

  if (isDuplicate(word)) {
    alert("이미 등록된 항목입니다.");
    return;
  }

  const items = getUserItems();
  items.push({
    id: makeId(),
    category: currentCategory,
    word,
    reading,
    meaning
  });

  saveUserItems(items);
  singleForm.reset();
  renderRecentItems();
  renderChapterScreen();
  renderHome();
  alert("저장됐습니다.");
});

function parseBulkItems(rawText) {
  const lines = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const parsed = [];
  let errorCount = 0;

  lines.forEach(line => {
    const parts = line.split(/\s+/);
    if (parts.length < 3) {
      errorCount += 1;
      return;
    }

    parsed.push({
      word: parts[0],
      reading: parts[1],
      meaning: parts.slice(2).join(" ")
    });
  });

  return { items: parsed, errorCount };
}

saveBulkButton.addEventListener("click", () => {
  const raw = bulkInput.value.trim();

  if (!raw) {
    alert("추가할 내용을 붙여넣어 주세요.");
    return;
  }

  const parsed = parseBulkItems(raw);

  if (parsed.items.length === 0) {
    alert("항목을 찾지 못했습니다.");
    return;
  }

  const preview = parsed.items
    .slice(0, 5)
    .map(item => `${item.word} / ${item.reading} / ${item.meaning}`)
    .join("\n");

  const moreText = parsed.items.length > 5
    ? `\n외 ${parsed.items.length - 5}개`
    : "";

  if (!confirm(`${parsed.items.length}개를 찾았습니다.\n\n${preview}${moreText}\n\n저장할까요?`)) {
    return;
  }

  const userItems = getUserItems();
  let saved = 0;
  let duplicate = 0;
  const existingKeys = new Set(getCategoryItems(currentCategory).map(item => normalizeDuplicateText(item.word)));

  parsed.items.forEach(item => {
    const key = normalizeDuplicateText(item.word);
    if (!key || existingKeys.has(key)) { duplicate += 1; return; }
    existingKeys.add(key);
    userItems.push({ id: makeId(), category: currentCategory, ...item });
    saved += 1;
  });

  saveUserItems(userItems);
  bulkInput.value = "";

  renderRecentItems();
  renderChapterScreen();
  renderHome();

  alert(`저장 ${saved}개\n중복 제외 ${duplicate}개\n형식 오류 ${parsed.errorCount}개`);
});

singleTabButton.addEventListener("click", () => {
  singleTabButton.classList.add("active");
  bulkTabButton.classList.remove("active");
  singleForm.hidden = false;
  bulkPanel.hidden = true;
});

bulkTabButton.addEventListener("click", () => {
  bulkTabButton.classList.add("active");
  singleTabButton.classList.remove("active");
  bulkPanel.hidden = false;
  singleForm.hidden = true;
});

function shuffleItems(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function renderRandomScreen() {
  randomWordCount.textContent = `${getCategoryItems("word").length}개 등록`;
  randomReviewCount.textContent = `${getCategoryItems("review").length}개 등록`;
  randomCountPanel.hidden = true;
  document.querySelectorAll(".random-category-button").forEach(button => {
    button.classList.remove("selected");
  });
}

function selectRandomCategory(category, selectedButton) {
  randomCategory = category;
  const itemCount = getCategoryItems(category).length;

  document.querySelectorAll(".random-category-button").forEach(button => {
    button.classList.toggle("selected", button === selectedButton);
  });

  randomSelectedTitle.textContent = CATEGORY_NAMES[category];
  randomCountPanel.hidden = false;
  randomCountHelp.textContent = itemCount === 0
    ? "아직 등록된 항목이 없습니다."
    : `현재 ${itemCount}개 등록 · 등록 개수 이하만 선택 가능`;

  document.querySelectorAll(".random-count-button").forEach(button => {
    const count = Number(button.dataset.randomCount);
    button.disabled = itemCount < count;
  });
}

function startRandomStudy(count) {
  const items = getCategoryItems(randomCategory);

  if (items.length < count) {
    alert(`${CATEGORY_NAMES[randomCategory]}가 ${count}개보다 적습니다.`);
    return;
  }

  currentCategory = randomCategory;
  randomRequestedCount = count;
  studyMode = "random";
  startStudy(shuffleItems(items).slice(0, count));
}

function startChapter(chapter) {
  const items = getCategoryItems(currentCategory);
  const blockStart = Math.floor((chapter - 1) / 4) * 200;
  const end = Math.min(chapter * CHAPTER_SIZE, items.length);

  studyMode = "chapter";
  selectedChapter = chapter;
  startStudy(items.slice(blockStart, end));
}

function startAnnoyingStudy() {
  const items = getAnnoyingItems();

  if (items.length === 0) {
    alert("아직 짜증나는 항목이 없습니다.");
    return;
  }

  studyMode = "annoying";
  startStudy(items);
}

function startStudy(items) {
  currentItems = [...items];
  nextRoundItems = [];
  currentIndex = 0;
  roundNumber = 1;

  showScreen("study");
  showCurrentItem();
}

function getCurrentItem() {
  return currentItems[currentIndex];
}

function showCurrentItem() {
  const item = getCurrentItem();

  if (!item) {
    finishStudy();
    return;
  }

  const categoryName = CATEGORY_NAMES[currentCategory];

  studyTitle.textContent = studyMode === "annoying"
    ? `${categoryName} 짜증나는 항목 ${roundNumber}회독`
    : studyMode === "search"
      ? `${categoryName} 검색 결과`
      : studyMode === "random"
        ? `${categoryName} 랜덤 ${randomRequestedCount}개`
        : `${categoryName} 제 ${selectedChapter}장 ${roundNumber}회독`;

  currentNumber.textContent = currentIndex + 1;
  totalNumber.textContent = currentItems.length;

  wordElement.textContent = item.word;
  readingElement.textContent = item.reading;
  meaningElement.textContent = item.meaning;

  answerElement.hidden = true;
  meaningButton.textContent = "뜻 보기";

  const count = getWrongCount(item.id);
  wrongCountBadge.textContent = `공부하겠음 ${count}회`;
  wrongCountBadge.classList.toggle("angry", count >= ANNOYING_LIMIT);

  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function nextItem() {
  currentIndex += 1;

  if (currentIndex < currentItems.length) {
    showCurrentItem();
    return;
  }

  if (nextRoundItems.length === 0) {
    finishStudy();
    return;
  }

  currentItems = [...nextRoundItems];
  nextRoundItems = [];
  currentIndex = 0;
  roundNumber += 1;
  showCurrentItem();
}

function finishStudy() {
  const categoryName = CATEGORY_NAMES[currentCategory];

  completeTitle.textContent = studyMode === "annoying"
    ? `${categoryName} 복습 완료!`
    : studyMode === "search"
      ? `${categoryName} 확인 완료!`
      : studyMode === "random"
        ? `${categoryName} 랜덤복습 완료!`
        : `${categoryName} 제 ${selectedChapter}장 완료!`;

  completeMessage.textContent = studyMode === "random"
    ? `${randomRequestedCount}개 랜덤복습을 마쳤습니다.`
    : `${roundNumber}회독까지 진행했습니다.`;
  renderHome();
  showScreen("complete");
}

meaningButton.addEventListener("click", () => {
  const hidden = answerElement.hidden;
  answerElement.hidden = !hidden;
  meaningButton.textContent = hidden ? "뜻 숨기기" : "뜻 보기";
});

function playSound() {
  if (!("speechSynthesis" in window)) return;

  const item = getCurrentItem();
  if (!item) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(item.reading);
  const voices = window.speechSynthesis.getVoices();
  const kyoko = voices.find(v => v.name.toLowerCase().includes("kyoko"));
  const japanese = voices.find(v => v.lang.toLowerCase().startsWith("ja"));

  speech.voice = kyoko || japanese || null;
  speech.lang = "ja-JP";
  speech.rate = 0.84;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

soundButton.addEventListener("click", playSound);
soundTouchArea.addEventListener("click", playSound);

studyAgainButton.addEventListener("click", () => {
  const item = getCurrentItem();
  if (!item) return;

  increaseWrongCount(item.id);
  nextRoundItems.push(item);
  nextItem();
});

knowButton.addEventListener("click", nextItem);

function renderAnnoying() {
  const items = getAnnoyingItems();
  annoyingWordList.innerHTML = "";

  if (items.length === 0) {
    annoyingWordList.innerHTML = '<div class="empty-box">공부하겠음을 8번 이상 누른 항목이 여기에 들어옵니다.</div>';
    return;
  }

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.word)}</strong>
        <span>${escapeHtml(item.reading)} · ${escapeHtml(item.meaning)}</span>
      </div>
      <b>${getWrongCount(item.id)}회</b>
    `;
    annoyingWordList.appendChild(row);
  });
}


function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .replace(/[　]/g, " ")
    .trim();
}

function renderSearchResults() {
  const query = normalizeSearchText(searchInput.value);
  searchResultList.innerHTML = "";

  if (!query) {
    searchSummary.textContent = "검색어를 입력해 주세요.";
    return;
  }

  const compact = query.replace(/\s+/g, "");
  const results = getAllItems().filter(item =>
    [item.word, item.reading, item.meaning, CATEGORY_NAMES[item.category || "word"]]
      .some(field => {
        const normalized = normalizeSearchText(field);
        return normalized.includes(query)
          || normalized.replace(/\s+/g, "").includes(compact);
      })
  );

  searchSummary.textContent = `검색 결과 ${results.length}개`;

  if (!results.length) {
    searchResultList.innerHTML = '<div class="search-empty">일치하는 항목이 없습니다.</div>';
    return;
  }

  results.slice(0, 200).forEach(item => {
    const category = item.category || "word";
    const row = document.createElement("button");
    row.type = "button";
    row.className = "search-result-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.word)}</strong>
        <span class="result-reading">${escapeHtml(item.reading)}</span>
        <span class="result-meaning">${escapeHtml(item.meaning)}</span>
      </div>
      <span class="result-category">${escapeHtml(CATEGORY_NAMES[category])}</span>
    `;
    row.addEventListener("click", () => {
      currentCategory = category;
      studyMode = "search";
      startStudy([item]);
    });
    searchResultList.appendChild(row);
  });
}

openSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  searchResultList.innerHTML = "";
  searchSummary.textContent = "검색어를 입력해 주세요.";
  showScreen("search");
  setTimeout(() => searchInput.focus(), 50);
});

closeSearchButton.addEventListener("click", () => {
  renderHome();
  showScreen("home");
});

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  renderSearchResults();
  searchInput.focus();
});

searchInput.addEventListener("input", renderSearchResults);

document.querySelectorAll(".category-book").forEach(button => {
  button.addEventListener("click", () => {
    currentCategory = button.dataset.category;
    renderChapterScreen();
    showScreen("chapter");
  });
});

closeChapterButton.addEventListener("click", () => {
  renderHome();
  showScreen("home");
});

openAddButton.addEventListener("click", () => {
  addTitle.textContent = `${CATEGORY_NAMES[currentCategory]} 추가`;
  renderRecentItems();
  showScreen("add");
});

closeAddButton.addEventListener("click", () => {
  renderChapterScreen();
  showScreen("chapter");
});

openAnnoyingButton.addEventListener("click", () => {
  renderAnnoying();
  showScreen("annoying");
});

closeAnnoyingButton.addEventListener("click", () => {
  renderChapterScreen();
  showScreen("chapter");
});

studyAnnoyingButton.addEventListener("click", startAnnoyingStudy);

function returnHome() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  renderHome();
  showScreen("home");
}

exitStudyButton.addEventListener("click", returnHome);
closeStudyButton.addEventListener("click", returnHome);
completeHomeButton.addEventListener("click", returnHome);

const removedDuplicateCount = removeSavedDuplicates();
renderHome();
showScreen("home");
if (removedDuplicateCount > 0) setTimeout(() => alert(`기존 중복 항목 ${removedDuplicateCount}개를 자동으로 정리했습니다.`), 250);
