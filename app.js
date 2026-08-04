// v12.1: editable bulk preview before Firebase save
import {
  waitForFirebaseReady,
  listenToSharedItems,
  addSharedItem,
  addSharedItems,
  updateSharedItem,
  removeSharedItem
} from "./firebase.js?v=121";

const CATEGORY_CHAPTER_SIZES = {
  word: 100,
  grammar: 20,
  conversation: 100,
  review: 100
};
const ANNOYING_LIMIT = 8;
const USER_ITEMS_KEY = "jpAppItemsV5";
const WRONG_COUNTS_KEY = "jpAppWrongCountsV5";
const ADDED_BY_KEY = "jpAppAddedByV9";
const MIGRATION_KEY = "jpAppCloudMigrationV9";

let sharedItems = [];
let cloudConnected = false;
let cloudRepairInProgress = false;

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
  unresolved: document.getElementById("unresolvedScreen"),
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
const previewBulkButton = document.getElementById("previewBulkButton");
const bulkPreview = document.getElementById("bulkPreview");
const recentWordList = document.getElementById("recentWordList");
const addedBySelect = document.getElementById("addedBySelect");
const cloudStatus = document.getElementById("cloudStatus");
const repairExistingItemsButton = document.getElementById("repairExistingItemsButton");
const repairExistingItemsStatus = document.getElementById("repairExistingItemsStatus");
const openUnresolvedItemsButton = document.getElementById("openUnresolvedItemsButton");
const unresolvedScreen = document.getElementById("unresolvedScreen");
const closeUnresolvedButton = document.getElementById("closeUnresolvedButton");
const unresolvedSummary = document.getElementById("unresolvedSummary");
const unresolvedItemList = document.getElementById("unresolvedItemList");

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
const editCurrentButton = document.getElementById("editCurrentButton");
const editItemDialog = document.getElementById("editItemDialog");
const closeEditDialogButton = document.getElementById("closeEditDialogButton");
const editItemForm = document.getElementById("editItemForm");
const editWordInput = document.getElementById("editWordInput");
const editReadingInput = document.getElementById("editReadingInput");
const editMeaningInput = document.getElementById("editMeaningInput");
const editItemOwner = document.getElementById("editItemOwner");
const deleteCurrentItemButton = document.getElementById("deleteCurrentItemButton");
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


function stripListNumber(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/^\s*(?:\d+|[①-⑳])\s*[.)、:：\-]\s*/, "")
    .trim();
}

function stripOuterSeparators(value) {
  return String(value || "")
    .trim()
    .replace(/^[\s\-–—|/·・]+/, "")
    .replace(/[\s\-–—|/·・]+$/, "")
    .trim();
}

function containsKana(value) {
  return /[\u3040-\u30ff]/.test(String(value || ""));
}

function containsJapanese(value) {
  return /[\u3040-\u30ff\u3400-\u9fff々〆ヵヶ]/.test(String(value || ""));
}

function containsKorean(value) {
  return /[\uac00-\ud7a3\u3131-\u318e]/.test(String(value || ""));
}

function mapThreeParts(parts) {
  const cleaned = parts.map(part => stripOuterSeparators(stripListNumber(part)));
  const readingIndex = cleaned.findIndex(containsKana);
  const koreanIndex = cleaned.findIndex(containsKorean);
  const japaneseIndex = cleaned.findIndex((part, index) =>
    index !== readingIndex && containsJapanese(part) && !containsKorean(part)
  );

  if (readingIndex >= 0 && koreanIndex >= 0 && japaneseIndex >= 0) {
    return {
      word: cleaned[japaneseIndex],
      reading: cleaned[readingIndex],
      meaning: cleaned[koreanIndex]
    };
  }

  // 기본 입력 순서: 일본어 / 히라가나 / 한국어 뜻
  return {
    word: cleaned[0],
    reading: cleaned[1],
    meaning: cleaned.slice(2).join(" ")
  };
}

function normalizeImportedItem(item) {
  const original = {
    ...item,
    word: stripOuterSeparators(item.word),
    reading: stripOuterSeparators(item.reading),
    meaning: stripOuterSeparators(item.meaning)
  };

  const numericWordOnly = /^\s*(?:\d+|[①-⑳])\s*[.)、:：\-]?\s*$/.test(
    String(original.word || "")
  );

  // 예전 일괄입력 오류 예:
  // word="39.", reading="분해", meaning="- ぶんかい - 分解"
  if (numericWordOnly) {
    const combined = `${original.reading || ""} ${original.meaning || ""}`
      .normalize("NFKC")
      .trim();

    // 하이픈 앞뒤에 공백이 있든 없든 모두 분리합니다.
    const separated = combined
      .split(/\s*(?:-|–|—|\||\/|·|・)\s*/)
      .map(stripOuterSeparators)
      .filter(Boolean);

    if (separated.length >= 3) {
      const mapped = mapThreeParts(separated);

      if (mapped.word && mapped.reading && mapped.meaning) {
        return { ...original, ...mapped };
      }
    }

    // 구분자가 비정상이어도 문자 종류를 이용해 마지막으로 복구 시도합니다.
    const tokens = combined
      .replace(/(?:-|–|—|\||\/|·|・)/g, " ")
      .split(/\s+/)
      .map(stripOuterSeparators)
      .filter(Boolean);

    if (tokens.length >= 3) {
      const mapped = mapThreeParts(tokens);

      if (mapped.word && mapped.reading && mapped.meaning) {
        return { ...original, ...mapped };
      }
    }

    // 확실히 복구하지 못한 항목은 빈 한자로 바꾸지 않고 원본을 유지합니다.
    return original;
  }

  return {
    ...original,
    word: stripListNumber(original.word)
  };
}

function getAllItems() {
  const baseWords = defaultWords.map(item => ({ ...item, category: "word" }));
  const cloudItems = sharedItems.map(item => normalizeImportedItem({
    ...item,
    category: item.category || "word"
  }));
  return [...baseWords, ...cloudItems];
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


function getChapterSize(category = currentCategory) {
  return CATEGORY_CHAPTER_SIZES[category] || 100;
}

function getChapterPlans(category, itemCount) {
  const size = getChapterSize(category);
  const newChunkCount = Math.ceil(itemCount / size);
  const plans = [];
  let displayChapter = 1;

  for (let chunkIndex = 0; chunkIndex < newChunkCount; chunkIndex += 2) {
    const firstStart = chunkIndex * size;
    const firstEnd = Math.min(firstStart + size, itemCount);

    plans.push({
      chapter: displayChapter,
      type: "new",
      start: firstStart,
      end: firstEnd,
      rangeStart: firstStart + 1,
      rangeEnd: firstEnd
    });
    displayChapter += 1;

    const secondStart = (chunkIndex + 1) * size;
    if (secondStart >= itemCount) break;

    const secondEnd = Math.min(secondStart + size, itemCount);
    plans.push({
      chapter: displayChapter,
      type: "new",
      start: secondStart,
      end: secondEnd,
      rangeStart: secondStart + 1,
      rangeEnd: secondEnd
    });
    displayChapter += 1;

    plans.push({
      chapter: displayChapter,
      type: "review",
      start: firstStart,
      end: secondEnd,
      rangeStart: firstStart + 1,
      rangeEnd: secondEnd
    });
    displayChapter += 1;
  }

  return plans;
}

function renderChapterScreen() {
  const items = getCategoryItems(currentCategory);
  const categoryName = CATEGORY_NAMES[currentCategory];
  const chapterSize = getChapterSize(currentCategory);

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

  const plans = getChapterPlans(currentCategory, items.length);

  plans.forEach(plan => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "chapter-card";

    if (plan.type === "review") {
      card.innerHTML = `
        <span class="chapter-name">제 ${plan.chapter}장 · 복습</span>
        <strong>${plan.rangeStart} ~ ${plan.rangeEnd}</strong>
        <small>앞의 두 장 합쳐서 ${plan.end - plan.start}개 복습<br>시작할 때마다 순서가 랜덤으로 바뀝니다</small>
      `;
    } else {
      card.innerHTML = `
        <span class="chapter-name">제 ${plan.chapter}장</span>
        <strong>${plan.rangeStart} ~ ${plan.rangeEnd}</strong>
        <small>새 항목 ${plan.end - plan.start}개 학습<br>${categoryName} 기준 장당 최대 ${chapterSize}개</small>
      `;
    }

    card.addEventListener("click", () => startChapter(plan.chapter));
    chapterList.appendChild(card);
  });
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
  const items = sharedItems.filter(item => (item.category || "word") === currentCategory);
  recentWordList.innerHTML = "";

  if (!cloudConnected) {
    recentWordList.innerHTML = '<div class="empty-box">공유 단어장에 연결 중입니다.</div>';
    return;
  }

  if (items.length === 0) {
    recentWordList.innerHTML = '<div class="empty-box">공유로 추가한 항목이 아직 없습니다.</div>';
    return;
  }

  [...items].reverse().slice(0, 50).forEach(item => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.word)}</strong>
        <span>${escapeHtml(item.reading)} · ${escapeHtml(item.meaning)}</span>
        <small class="added-by">추가: ${escapeHtml(item.addedBy || "이름 없음")}</small>
      </div>
      <button type="button" data-id="${item.id}">삭제</button>
    `;
    row.querySelector("button").addEventListener("click", () => deleteItem(item.id));
    recentWordList.appendChild(row);
  });
}

async function deleteItem(id) {
  if (!confirm("이 항목을 두 사람의 공유 단어장에서 삭제할까요?")) return;

  try {
    await removeSharedItem(id);

    const counts = getWrongCounts();
    delete counts[id];
    saveWrongCounts(counts);
  } catch (error) {
    console.error(error);
    alert("삭제하지 못했습니다. 인터넷 연결을 확인해 주세요.");
  }
}

singleForm.addEventListener("submit", async event => {
  event.preventDefault();

  const word = wordInput.value.trim();
  const reading = readingInput.value.trim();
  const meaning = meaningInput.value.trim();

  if (!word || !reading || !meaning) return;

  if (!cloudConnected) {
    alert("공유 단어장 연결이 끝난 뒤 다시 눌러 주세요.");
    return;
  }

  if (isDuplicate(word)) {
    alert("이미 등록된 항목입니다.");
    return;
  }

  try {
    await addSharedItem({
      category: currentCategory,
      word,
      reading,
      meaning,
      addedBy: addedBySelect.value
    });

    singleForm.reset();
    alert("두 사람의 공유 단어장에 저장됐습니다.");
  } catch (error) {
    console.error(error);
    alert("저장하지 못했습니다. 인터넷 연결을 확인해 주세요.");
  }
});

function isStandaloneListNumber(line) {
  return /^\s*(?:\d+|[①-⑳])\s*[.)、:：\-]?\s*$/.test(String(line || ""));
}

function splitDelimitedLine(line) {
  const stripped = stripListNumber(line);
  const pipe = stripped.split(/\s*\|\s*/).map(stripOuterSeparators).filter(Boolean);
  if (pipe.length >= 3) return pipe;
  const dash = stripped.split(/\s+(?:-|–|—)\s+/).map(stripOuterSeparators).filter(Boolean);
  if (dash.length >= 3) return dash;
  const slash = stripped.split(/\s*\/\s*/).map(stripOuterSeparators).filter(Boolean);
  if (slash.length >= 3) return slash;
  return null;
}

function parseBulkItems(rawText) {
  const lines = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")
    .map((line, index) => ({ text: line.trim(), lineNumber: index + 1 }))
    .filter(line => line.text);

  const items = [];
  const errors = [];
  let cursor = 0;

  while (cursor < lines.length) {
    const current = lines[cursor];

    if (isStandaloneListNumber(current.text)) {
      cursor += 1;
      continue;
    }

    const delimited = splitDelimitedLine(current.text);
    if (delimited) {
      const mapped = mapThreeParts(delimited);
      if (mapped.word && mapped.reading && mapped.meaning) {
        items.push(mapped);
      } else {
        errors.push({ lineNumber: current.lineNumber, text: current.text, reason: "세 칸을 구분하지 못했습니다." });
      }
      cursor += 1;
      continue;
    }

    const group = [];
    let scan = cursor;
    while (scan < lines.length && group.length < 3) {
      if (isStandaloneListNumber(lines[scan].text)) {
        scan += 1;
        continue;
      }
      group.push(lines[scan]);
      scan += 1;
    }

    if (group.length < 3) {
      errors.push({ lineNumber: current.lineNumber, text: current.text, reason: "3줄 형식이 완성되지 않았습니다." });
      cursor += 1;
      continue;
    }

    const mapped = mapThreeParts(group.map(entry => stripOuterSeparators(stripListNumber(entry.text))));
    if (mapped.word && mapped.reading && mapped.meaning) {
      items.push(mapped);
      cursor = scan;
    } else {
      errors.push({
        lineNumber: group[0].lineNumber,
        text: group.map(entry => entry.text).join(" / "),
        reason: "일본어·읽는 법·뜻을 구분하지 못했습니다."
      });
      cursor += 1;
    }
  }

  return { items, errors };
}

let lastBulkPreview = { items: [], errors: [] };

function renderBulkPreview(result) {
  lastBulkPreview = {
    items: result.items.map(item => ({ ...item })),
    errors: [...result.errors]
  };

  bulkPreview.hidden = false;

  const preview = lastBulkPreview.items.map((item, index) => `
    <article class="bulk-edit-card" data-index="${index}">
      <div class="bulk-edit-head">
        <strong>${index + 1}번째 항목</strong>
        <span>저장 전 수정 가능</span>
      </div>

      <label>
        일본어 한자·표현
        <input
          class="bulk-edit-input"
          data-field="word"
          value="${escapeHtml(item.word)}"
          autocomplete="off"
        >
      </label>

      <label>
        읽는 법
        <input
          class="bulk-edit-input"
          data-field="reading"
          value="${escapeHtml(item.reading)}"
          autocomplete="off"
        >
      </label>

      <label>
        한국어 뜻
        <input
          class="bulk-edit-input"
          data-field="meaning"
          value="${escapeHtml(item.meaning)}"
          autocomplete="off"
        >
      </label>
    </article>
  `).join("");

  const errorHtml = lastBulkPreview.errors.length ? `
    <details class="bulk-error-details">
      <summary>형식 오류 ${lastBulkPreview.errors.length}개 보기</summary>
      ${lastBulkPreview.errors.map(error => `
        <div class="bulk-error-item">
          <strong>${error.lineNumber}번째 줄</strong>
          <span>${escapeHtml(error.text)}</span>
          <small>${escapeHtml(error.reason)}</small>
        </div>
      `).join("")}
    </details>
  ` : '<p class="bulk-ok-message">형식 오류 없음</p>';

  bulkPreview.innerHTML = `
    <div class="bulk-preview-summary">
      <strong>인식 성공 ${lastBulkPreview.items.length}개</strong>
      <span>형식 오류 ${lastBulkPreview.errors.length}개</span>
    </div>

    <p class="help">오타가 있으면 아래 칸에서 바로 고친 뒤 저장하세요.</p>

    <div class="bulk-preview-list">
      ${preview || '<p class="help">인식된 항목이 없습니다.</p>'}
    </div>

    ${errorHtml}
  `;

  bulkPreview.querySelectorAll(".bulk-edit-input").forEach(input => {
    input.addEventListener("input", event => {
      const card = event.target.closest(".bulk-edit-card");
      const index = Number(card.dataset.index);
      const field = event.target.dataset.field;

      if (!lastBulkPreview.items[index]) return;
      lastBulkPreview.items[index][field] = event.target.value.trim();
      updateBulkSaveButtonState();
    });

    input.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();

      const inputs = [...bulkPreview.querySelectorAll(".bulk-edit-input")];
      const currentIndex = inputs.indexOf(event.target);
      const nextInput = inputs[currentIndex + 1];

      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      } else if (!saveBulkButton.disabled) {
        saveBulkButton.focus();
      }
    });
  });

  updateBulkSaveButtonState();
}

function updateBulkSaveButtonState() {
  const hasItems = lastBulkPreview.items.length > 0;
  const allComplete = lastBulkPreview.items.every(item =>
    String(item.word || "").trim() &&
    String(item.reading || "").trim() &&
    String(item.meaning || "").trim()
  );

  saveBulkButton.disabled = !(hasItems && allComplete);
}

previewBulkButton.addEventListener("click", () => {
  if (!bulkInput.value.trim()) {
    alert("먼저 단어를 붙여넣어 주세요.");
    return;
  }
  renderBulkPreview(parseBulkItems(bulkInput.value));
});

bulkInput.addEventListener("input", () => {
  lastBulkPreview = { items: [], errors: [] };
  bulkPreview.hidden = true;
  bulkPreview.innerHTML = "";
  saveBulkButton.disabled = true;
});

saveBulkButton.addEventListener("click", async () => {
  if (!cloudConnected) {
    alert("공유 연결이 끝난 뒤 다시 눌러 주세요.");
    return;
  }

  if (lastBulkPreview.items.length === 0) {
    alert("먼저 '먼저 확인하기'를 눌러 주세요.");
    return;
  }

  const existingKeys = new Set(
    getCategoryItems(currentCategory).map(item => normalizeDuplicateText(item.word))
  );

  let duplicateCount = 0;
  const itemsToSave = [];

  lastBulkPreview.items.forEach(item => {
    const cleanedItem = {
      ...item,
      word: String(item.word || "").trim(),
      reading: String(item.reading || "").trim(),
      meaning: String(item.meaning || "").trim()
    };

    if (!cleanedItem.word || !cleanedItem.reading || !cleanedItem.meaning) {
      return;
    }

    const key = normalizeDuplicateText(cleanedItem.word);
    if (!key || existingKeys.has(key)) {
      duplicateCount += 1;
      return;
    }

    existingKeys.add(key);
    itemsToSave.push({
      category: currentCategory,
      ...cleanedItem,
      addedBy: addedBySelect.value
    });
  });

  if (itemsToSave.length === 0) {
    alert(`새로 저장할 항목이 없습니다.\n중복 제외 ${duplicateCount}개`);
    return;
  }

  previewBulkButton.disabled = true;
  saveBulkButton.disabled = true;
  saveBulkButton.textContent = "저장 중…";

  try {
    await addSharedItems(itemsToSave);
    alert(`공유 저장 ${itemsToSave.length}개\n중복 제외 ${duplicateCount}개\n형식 오류 ${lastBulkPreview.errors.length}개`);

    bulkInput.value = "";
    bulkPreview.hidden = true;
    bulkPreview.innerHTML = "";
    lastBulkPreview = { items: [], errors: [] };
  } catch (error) {
    console.error(error);
    alert("저장하지 못했습니다. 인터넷 연결을 확인해 주세요.");
  } finally {
    previewBulkButton.disabled = false;
    saveBulkButton.disabled = true;
    saveBulkButton.textContent = "확인한 항목 저장하기";
  }
});

addedBySelect.value = localStorage.getItem(ADDED_BY_KEY) || "도현";
addedBySelect.addEventListener("change", () => {
  localStorage.setItem(ADDED_BY_KEY, addedBySelect.value);
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
  const plan = getChapterPlans(currentCategory, items.length)
    .find(candidate => candidate.chapter === chapter);

  if (!plan) {
    alert("이 장을 불러오지 못했습니다.");
    return;
  }

  studyMode = "chapter";
  selectedChapter = chapter;

  // 같은 장을 다시 열어도 항상 새로운 순서로 시작합니다.
  startStudy(shuffleItems(items.slice(plan.start, plan.end)));
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
        : (() => {
          const plan = getChapterPlans(currentCategory, getCategoryItems(currentCategory).length)
            .find(candidate => candidate.chapter === selectedChapter);
          const reviewLabel = plan?.type === "review" ? " 복습" : "";
          return `${categoryName} 제 ${selectedChapter}장${reviewLabel} ${roundNumber}회독`;
        })();

  currentNumber.textContent = currentIndex + 1;
  totalNumber.textContent = currentItems.length;

  wordElement.textContent = item.word;
  readingElement.textContent = item.reading;
  meaningElement.textContent = item.meaning;
  editCurrentButton.hidden = !item.shared;

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

  currentItems = shuffleItems(nextRoundItems);
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


function openCurrentItemEditor() {
  const item = getCurrentItem();

  if (!item || !item.shared) {
    alert("직접 추가한 항목만 수정할 수 있습니다.");
    return;
  }

  editWordInput.value = item.word || "";
  editReadingInput.value = item.reading || "";
  editMeaningInput.value = item.meaning || "";
  editItemOwner.textContent = `추가한 사람: ${item.addedBy || "이름 없음"}`;
  editItemDialog.hidden = false;
  document.body.classList.add("dialog-open");

  setTimeout(() => editWordInput.focus(), 50);
}

function closeCurrentItemEditor() {
  editItemDialog.hidden = true;
  document.body.classList.remove("dialog-open");
}

editCurrentButton.addEventListener("click", openCurrentItemEditor);
closeEditDialogButton.addEventListener("click", closeCurrentItemEditor);

editItemDialog.addEventListener("click", event => {
  if (event.target === editItemDialog) closeCurrentItemEditor();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !editItemDialog.hidden) {
    closeCurrentItemEditor();
  }
});

editItemForm.addEventListener("submit", async event => {
  event.preventDefault();

  const item = getCurrentItem();
  if (!item || !item.shared) return;

  const word = editWordInput.value.trim();
  const reading = editReadingInput.value.trim();
  const meaning = editMeaningInput.value.trim();

  if (!word || !reading || !meaning) {
    alert("한자·히라가나·뜻을 모두 입력해 주세요.");
    return;
  }

  const duplicate = sharedItems.find(candidate =>
    candidate.id !== item.id
    && (candidate.category || "word") === (item.category || currentCategory)
    && normalizeDuplicateText(candidate.word) === normalizeDuplicateText(word)
  );

  if (duplicate) {
    alert("같은 카테고리에 이미 등록된 항목입니다.");
    return;
  }

  const saveButton = editItemForm.querySelector(".edit-save-button");
  saveButton.disabled = true;
  saveButton.textContent = "저장 중…";

  try {
    const newId = await updateSharedItem(item.id, {
      ...item,
      word,
      reading,
      meaning,
      category: item.category || currentCategory
    });

    const updatedItem = {
      ...item,
      id: newId,
      word,
      reading,
      meaning
    };

    currentItems[currentIndex] = updatedItem;
    nextRoundItems = nextRoundItems.map(roundItem =>
      roundItem.id === item.id ? updatedItem : roundItem
    );

    closeCurrentItemEditor();
    showCurrentItem();
  } catch (error) {
    console.error(error);
    alert("수정하지 못했습니다. 인터넷 연결을 확인해 주세요.");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "수정 저장";
  }
});

deleteCurrentItemButton.addEventListener("click", async () => {
  const item = getCurrentItem();
  if (!item || !item.shared) return;

  if (!confirm(`"${item.word}" 항목을 공유 단어장에서 삭제할까요?`)) return;

  deleteCurrentItemButton.disabled = true;
  deleteCurrentItemButton.textContent = "삭제 중…";

  try {
    await removeSharedItem(item.id);

    const counts = getWrongCounts();
    delete counts[item.id];
    saveWrongCounts(counts);

    currentItems.splice(currentIndex, 1);
    nextRoundItems = nextRoundItems.filter(roundItem => roundItem.id !== item.id);

    closeCurrentItemEditor();

    if (currentIndex >= currentItems.length) {
      currentIndex = Math.max(0, currentItems.length - 1);
    }

    if (currentItems.length === 0) {
      finishStudy();
    } else {
      showCurrentItem();
    }
  } catch (error) {
    console.error(error);
    alert("삭제하지 못했습니다. 인터넷 연결을 확인해 주세요.");
  } finally {
    deleteCurrentItemButton.disabled = false;
    deleteCurrentItemButton.textContent = "삭제";
  }
});

function getPreferredJapaneseVoice() {
  const voices = window.speechSynthesis.getVoices();
  const japaneseVoices = voices.filter(voice =>
    String(voice.lang || "").toLowerCase().startsWith("ja")
  );

  const preferredNames = [
    "otoya premium",
    "otoya enhanced",
    "otoya",
    "オトヤ",
    "kyoko premium",
    "kyoko enhanced",
    "kyoko",
    "キョウコ"
  ];

  for (const preferredName of preferredNames) {
    const matchedVoice = japaneseVoices.find(voice =>
      String(voice.name || "").toLowerCase().includes(preferredName.toLowerCase())
    );
    if (matchedVoice) return matchedVoice;
  }

  return japaneseVoices.find(voice => voice.default) || japaneseVoices[0] || null;
}

function playSound() {
  if (!("speechSynthesis" in window)) return;

  const item = getCurrentItem();
  if (!item) return;

  window.speechSynthesis.cancel();

  // 한자를 포함한 실제 표기를 읽히면 일본어 단어의 억양이 더 자연스러운 경우가 많습니다.
  const speechText = String(item.word || item.reading || "").trim();
  const speech = new SpeechSynthesisUtterance(speechText);

  speech.voice = getPreferredJapaneseVoice();
  speech.lang = "ja-JP";
  speech.rate = 0.92;
  speech.pitch = 1;
  speech.volume = 1;

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

function setCloudStatus(text, state = "loading") {
  cloudStatus.textContent = text;
  cloudStatus.dataset.state = state;
}

async function migrateLocalItemsToCloud() {
  if (localStorage.getItem(MIGRATION_KEY) === "done") return;

  const localItems = getUserItems();

  if (localItems.length === 0) {
    localStorage.setItem(MIGRATION_KEY, "done");
    return;
  }

  const existingKeys = new Set(
    sharedItems.map(item => `${item.category || "word"}::${normalizeDuplicateText(item.word)}`)
  );

  const addedBy = localStorage.getItem(ADDED_BY_KEY) || "도현";
  const itemsToMigrate = localItems
    .filter(item => {
      const key = `${item.category || "word"}::${normalizeDuplicateText(item.word)}`;
      if (!normalizeDuplicateText(item.word) || existingKeys.has(key)) return false;
      existingKeys.add(key);
      return true;
    })
    .map(item => ({
      category: item.category || "word",
      word: item.word,
      reading: item.reading,
      meaning: item.meaning,
      example: item.example || "",
      addedBy
    }));

  if (itemsToMigrate.length > 0) {
    await addSharedItems(itemsToMigrate);
  }

  saveUserItems([]);
  localStorage.setItem(MIGRATION_KEY, "done");

  alert(
    itemsToMigrate.length > 0
      ? `이 기기에 저장돼 있던 항목 ${itemsToMigrate.length}개를 공유 단어장으로 옮겼습니다.`
      : "이 기기의 기존 항목은 이미 공유 단어장에 있어 중복 없이 정리했습니다."
  );
}


function getMalformedItemRepairReport(items = sharedItems) {
  const repairs = [];
  const unresolved = [];

  items.forEach(item => {
    const normalized = normalizeImportedItem(item);
    const changed =
      normalized.word !== item.word ||
      normalized.reading !== item.reading ||
      normalized.meaning !== item.meaning;

    if (!changed) {
      const looksMalformed =
        /^\s*(?:\d+|[①-⑳])\s*[.)、:：\-]?\s*$/.test(String(item.word || ""));

      if (looksMalformed) unresolved.push(item);
      return;
    }

    const valid =
      String(normalized.word || "").trim() &&
      String(normalized.reading || "").trim() &&
      String(normalized.meaning || "").trim();

    if (!valid) {
      unresolved.push(item);
      return;
    }

    repairs.push({
      original: item,
      normalized: {
        ...item,
        category: item.category || "word",
        word: normalized.word,
        reading: normalized.reading,
        meaning: normalized.meaning,
        example: item.example || "",
        addedBy: item.addedBy || "도현"
      }
    });
  });

  return { repairs, unresolved };
}

function getMalformedItemRepairs(items = sharedItems) {
  return getMalformedItemRepairReport(items).repairs;
}


function renderUnresolvedItems() {
  const report = getMalformedItemRepairReport();
  const unresolvedItems = report.unresolved;

  unresolvedSummary.textContent = unresolvedItems.length > 0
    ? `남은 미확정 항목 ${unresolvedItems.length}개`
    : "미확정 항목이 없습니다.";

  unresolvedItemList.innerHTML = "";

  if (unresolvedItems.length === 0) {
    unresolvedItemList.innerHTML = `
      <div class="empty-box">
        자동 판별이 어려운 항목이 없습니다.<br>
        모든 항목이 정상적으로 정리됐습니다.
      </div>
    `;
    openUnresolvedItemsButton.hidden = true;
    return;
  }

  unresolvedItems.forEach((item, index) => {
    const row = document.createElement("article");
    row.className = "unresolved-item-card";

    row.innerHTML = `
      <div class="unresolved-item-head">
        <strong>${index + 1} / ${unresolvedItems.length}</strong>
        <small>기존 저장 내용</small>
      </div>

      <div class="unresolved-original">
        <span>${escapeHtml(item.word || "(비어 있음)")}</span>
        <span>${escapeHtml(item.reading || "(비어 있음)")}</span>
        <span>${escapeHtml(item.meaning || "(비어 있음)")}</span>
      </div>

      <form class="unresolved-edit-form">
        <label>
          일본어 한자·표현
          <input name="word" required value="${escapeHtml(stripListNumber(item.word || ""))}">
        </label>

        <label>
          읽는 법
          <input name="reading" required value="${escapeHtml(stripOuterSeparators(item.reading || ""))}">
        </label>

        <label>
          한국어 뜻
          <input name="meaning" required value="${escapeHtml(stripOuterSeparators(item.meaning || ""))}">
        </label>

        <button class="primary-button" type="submit">수정해서 저장</button>
      </form>
    `;

    const form = row.querySelector(".unresolved-edit-form");

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const formData = new FormData(form);
      const word = String(formData.get("word") || "").trim();
      const reading = String(formData.get("reading") || "").trim();
      const meaning = String(formData.get("meaning") || "").trim();

      if (!word || !reading || !meaning) {
        alert("일본어, 읽는 법, 한국어 뜻을 모두 입력해 주세요.");
        return;
      }

      const saveButton = form.querySelector('button[type="submit"]');
      saveButton.disabled = true;
      saveButton.textContent = "저장 중…";

      try {
        await updateSharedItem(item.id, {
          ...item,
          category: item.category || "word",
          word,
          reading,
          meaning,
          example: item.example || "",
          addedBy: item.addedBy || "도현"
        });

        row.remove();

        // Firebase 실시간 동기화가 반영될 때까지 잠깐 기다린 뒤 다시 표시합니다.
        setTimeout(() => {
          renderUnresolvedItems();
        }, 400);
      } catch (error) {
        console.error("미확정 항목 수정 실패:", error);
        alert("저장하지 못했습니다. 인터넷 연결을 확인해 주세요.");
        saveButton.disabled = false;
        saveButton.textContent = "수정해서 저장";
      }
    });

    unresolvedItemList.appendChild(row);
  });
}

function updateUnresolvedButton() {
  const unresolvedCount = getMalformedItemRepairReport().unresolved.length;
  openUnresolvedItemsButton.hidden = unresolvedCount === 0;
  openUnresolvedItemsButton.textContent = unresolvedCount > 0
    ? `미확정 항목만 보기 (${unresolvedCount}개)`
    : "미확정 항목만 보기";
}

openUnresolvedItemsButton.addEventListener("click", () => {
  renderUnresolvedItems();
  showScreen("unresolved");
});

closeUnresolvedButton.addEventListener("click", () => {
  showScreen("add");
});

async function repairMalformedCloudItems(items = sharedItems, showResult = false) {
  if (cloudRepairInProgress) return 0;

  const report = getMalformedItemRepairReport(items);
  const repairs = report.repairs;
  const unresolvedCount = report.unresolved.length;

  if (repairs.length === 0) {
    if (showResult) {
      const message = unresolvedCount > 0
        ? `자동 판별이 어려운 항목 ${unresolvedCount}개가 남아 있습니다.`
        : "고칠 항목이 없습니다. 모두 정상입니다.";
      repairExistingItemsStatus.textContent = message;
      alert(message);
    }
    return 0;
  }

  cloudRepairInProgress = true;
  repairExistingItemsButton.disabled = true;
  repairExistingItemsButton.textContent = `복구 중 0 / ${repairs.length}`;
  repairExistingItemsStatus.textContent = `${repairs.length}개 항목을 복구하고 있습니다. 앱을 닫지 마세요.`;

  let repairedCount = 0;

  try {
    for (const repair of repairs) {
      await updateSharedItem(repair.original.id, repair.normalized);
      repairedCount += 1;
      repairExistingItemsButton.textContent = `복구 중 ${repairedCount} / ${repairs.length}`;
    }

    const unresolvedText = unresolvedCount > 0
      ? `
자동 판별이 어려운 항목 ${unresolvedCount}개는 건드리지 않았습니다.`
      : "";
    repairExistingItemsStatus.textContent = unresolvedCount > 0
      ? `${repairedCount}개 복구 완료 · 미확정 ${unresolvedCount}개`
      : `${repairedCount}개 복구 완료`;
    updateUnresolvedButton();
    if (showResult) {
      alert(`${repairedCount}개 항목을 정상 형식으로 복구했습니다.${unresolvedText}`);
    }
    return repairedCount;
  } catch (error) {
    console.error("공유 항목 자동 수정 실패:", error);
    repairExistingItemsStatus.textContent = `${repairedCount}개까지 복구 후 오류가 발생했습니다. 다시 누르면 이어서 처리됩니다.`;
    if (showResult) {
      alert(`${repairedCount}개까지 복구했습니다.\n인터넷 연결을 확인한 뒤 버튼을 다시 눌러 주세요.`);
    }
    return repairedCount;
  } finally {
    cloudRepairInProgress = false;
    repairExistingItemsButton.disabled = false;
    repairExistingItemsButton.textContent = "기존 단어 검사·복구";
  }
}

repairExistingItemsButton.addEventListener("click", async () => {
  if (!cloudConnected) {
    alert("공유 연결이 끝난 뒤 다시 눌러 주세요.");
    return;
  }

  const report = getMalformedItemRepairReport();
  const repairs = report.repairs;
  const unresolvedCount = report.unresolved.length;

  if (repairs.length === 0) {
    repairExistingItemsStatus.textContent = "고칠 항목이 없습니다. 모두 정상입니다.";
    alert("고칠 항목이 없습니다. 모두 정상입니다.");
    return;
  }

  const preview = repairs
    .slice(0, 5)
    .map(({ original, normalized }) =>
      `${original.word} / ${original.reading} / ${original.meaning}\n→ ${normalized.word} / ${normalized.reading} / ${normalized.meaning}`
    )
    .join("\n\n");

  const extra = repairs.length > 5 ? `\n\n외 ${repairs.length - 5}개` : "";

  if (!confirm(
    `잘못 저장된 항목 ${repairs.length}개를 찾았습니다.\n\n${preview}${extra}\n\n전부 자동으로 복구할까요?`
  )) return;

  await repairMalformedCloudItems(sharedItems, true);
});

async function startCloudSync() {
  setCloudStatus("로그인 중…", "loading");

  try {
    await waitForFirebaseReady();

    listenToSharedItems(
      async items => {
        const firstConnection = !cloudConnected;
        sharedItems = items;
        cloudConnected = true;
        setCloudStatus("공유 연결됨", "connected");

        const repairReport = getMalformedItemRepairReport(items);
        const repairCount = repairReport.repairs.length;
        const unresolvedCount = repairReport.unresolved.length;

        repairExistingItemsStatus.textContent = repairCount > 0
          ? `복구 가능한 항목 ${repairCount}개 · 미확정 ${unresolvedCount}개`
          : unresolvedCount > 0
            ? `자동 판별이 어려운 항목 ${unresolvedCount}개가 남아 있습니다.`
            : "기존 저장 항목이 정상입니다.";

        updateUnresolvedButton();

        if (!screens.unresolved.hidden) {
          renderUnresolvedItems();
        }

        renderHome();

        if (!screens.chapter.hidden) renderChapterScreen();
        if (!screens.add.hidden) renderRecentItems();
        if (!screens.search.hidden) renderSearchResults();

        if (firstConnection) {
          try {
            await migrateLocalItemsToCloud();
          } catch (migrationError) {
            console.error("기존 항목 이전 실패:", migrationError);
            alert("기존 항목을 공유 단어장으로 옮기지 못했습니다. 기존 자료는 기기에 남아 있습니다.");
          }
        }
      },
      error => {
        console.error(error);
        cloudConnected = false;
        setCloudStatus("연결 오류", "error");
      }
    );
  } catch (error) {
    console.error(error);
    cloudConnected = false;
    setCloudStatus("로그인 오류", "error");
    alert("Firebase에 로그인하지 못했습니다. 인터넷 연결과 Firebase 설정을 확인해 주세요.");
  }
}

renderHome();
showScreen("home");
startCloudSync();
