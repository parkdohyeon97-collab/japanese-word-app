console.info("Japanese Word App v22.6 loaded");
// v22.5: reveal all grammar details in one tap and play example audio on tap
import {
  waitForFirebaseReady,
  listenToSharedItems,
  addSharedItem,
  addSharedItems,
  updateSharedItem,
  removeSharedItem,
  listenToStudyProgress,
  saveStudyProgress
} from "./firebase.js?v=225";

const CATEGORY_CHAPTER_SIZES = {
  word: 100,
  grammar: 20,
  conversation: 20,
  review: 100
};
const ANNOYING_LIMIT = 8;
const USER_ITEMS_KEY = "jpAppItemsV5";
const WRONG_COUNTS_KEY = "jpAppWrongCountsV5";
const ADDED_BY_KEY = "jpAppAddedByV9";
const MIGRATION_KEY = "jpAppCloudMigrationV9";
const STUDY_PROGRESS_KEY = "jpAppStudyProgressV15";
const RANDOM_REVIEW_HISTORY_KEY = "jpAppRandomReviewHistoryV163";
const RANDOM_REVIEW_PROGRESS_KEY = "jpAppRandomReviewProgressV164";
const GRADUATED_ITEMS_KEY = "jpAppGraduatedItemsV19";


const RELATED_WORDS = {
  "始める": [
    { word: "始まる", reading: "はじまる", meaning: "시작되다", reason: "「始める」와 꼭 같이 외우는 자동사" }
  ],
  "始まる": [
    { word: "始める", reading: "はじめる", meaning: "시작하다", reason: "「始まる」와 꼭 같이 외우는 타동사" }
  ],
  "開ける": [
    { word: "開く", reading: "あく", meaning: "열리다", reason: "자동사·타동사 짝" }
  ],
  "開く": [
    { word: "開ける", reading: "あける", meaning: "열다", reason: "자동사·타동사 짝" }
  ],
  "閉める": [
    { word: "閉まる", reading: "しまる", meaning: "닫히다", reason: "자동사·타동사 짝" }
  ],
  "閉まる": [
    { word: "閉める", reading: "しめる", meaning: "닫다", reason: "자동사·타동사 짝" }
  ],
  "付ける": [
    { word: "付く", reading: "つく", meaning: "붙다, 켜지다", reason: "자동사·타동사 짝" }
  ],
  "付く": [
    { word: "付ける", reading: "つける", meaning: "붙이다, 켜다", reason: "자동사·타동사 짝" }
  ],
  "消す": [
    { word: "消える", reading: "きえる", meaning: "꺼지다, 사라지다", reason: "자동사·타동사 짝" }
  ],
  "消える": [
    { word: "消す", reading: "けす", meaning: "끄다, 지우다", reason: "자동사·타동사 짝" }
  ],
  "落とす": [
    { word: "落ちる", reading: "おちる", meaning: "떨어지다", reason: "자동사·타동사 짝" }
  ],
  "落ちる": [
    { word: "落とす", reading: "おとす", meaning: "떨어뜨리다", reason: "자동사·타동사 짝" }
  ],
  "増やす": [
    { word: "増える", reading: "ふえる", meaning: "늘다, 증가하다", reason: "자동사·타동사 짝" }
  ],
  "増える": [
    { word: "増やす", reading: "ふやす", meaning: "늘리다, 증가시키다", reason: "자동사·타동사 짝" }
  ],
  "減らす": [
    { word: "減る", reading: "へる", meaning: "줄다, 감소하다", reason: "자동사·타동사 짝" }
  ],
  "減る": [
    { word: "減らす", reading: "へらす", meaning: "줄이다, 감소시키다", reason: "자동사·타동사 짝" }
  ],
  "壊す": [
    { word: "壊れる", reading: "こわれる", meaning: "망가지다, 부서지다", reason: "자동사·타동사 짝" }
  ],
  "壊れる": [
    { word: "壊す", reading: "こわす", meaning: "망가뜨리다, 부수다", reason: "자동사·타동사 짝" }
  ],
  "決める": [
    { word: "決まる", reading: "きまる", meaning: "정해지다", reason: "자동사·타동사 짝" }
  ],
  "決まる": [
    { word: "決める", reading: "きめる", meaning: "정하다, 결정하다", reason: "자동사·타동사 짝" }
  ],
  "続ける": [
    { word: "続く", reading: "つづく", meaning: "계속되다, 이어지다", reason: "자동사·타동사 짝" }
  ],
  "続く": [
    { word: "続ける", reading: "つづける", meaning: "계속하다, 이어가다", reason: "자동사·타동사 짝" }
  ],
  "集める": [
    { word: "集まる", reading: "あつまる", meaning: "모이다", reason: "자동사·타동사 짝" }
  ],
  "集まる": [
    { word: "集める", reading: "あつめる", meaning: "모으다", reason: "자동사·타동사 짝" }
  ],
  "変える": [
    { word: "変わる", reading: "かわる", meaning: "바뀌다, 변하다", reason: "자동사·타동사 짝" }
  ],
  "変わる": [
    { word: "変える", reading: "かえる", meaning: "바꾸다, 변화시키다", reason: "자동사·타동사 짝" }
  ],
  "深い": [
    { word: "浅い", reading: "あさい", meaning: "얕다", reason: "자주 함께 외우는 반대말" }
  ],
  "浅い": [
    { word: "深い", reading: "ふかい", meaning: "깊다", reason: "자주 함께 외우는 반대말" }
  ],
  "重い": [
    { word: "軽い", reading: "かるい", meaning: "가볍다", reason: "자주 함께 외우는 반대말" }
  ],
  "軽い": [
    { word: "重い", reading: "おもい", meaning: "무겁다", reason: "자주 함께 외우는 반대말" }
  ],
  "経験": [
    { word: "未経験", reading: "みけいけん", meaning: "경험이 없음, 미경험", reason: "실제로 자주 쓰는 핵심 파생어" }
  ]
};

let pendingRelatedWords = [];
let relatedSourceWord = "";

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
  random: document.getElementById("randomScreen"),
  sharedList: document.getElementById("sharedListScreen"),
  graduated: document.getElementById("graduatedScreen"),
  duplicateScan: document.getElementById("duplicateScanScreen")
};

const categoryTitle = document.getElementById("categoryTitle");
const categoryTotalCount = document.getElementById("categoryTotalCount");
const chapterList = document.getElementById("chapterList");
const wordCategoryCount = document.getElementById("wordCategoryCount");
const grammarCategoryCount = document.getElementById("grammarCategoryCount");
const conversationCategoryCount = document.getElementById("conversationCategoryCount");
const reviewCategoryCount = document.getElementById("reviewCategoryCount");
const annoyingMenuCount = document.getElementById("annoyingMenuCount");
const graduatedMenuCount = document.getElementById("graduatedMenuCount");
const openGraduatedButton = document.getElementById("openGraduatedButton");
const closeGraduatedButton = document.getElementById("closeGraduatedButton");
const graduatedTotalCount = document.getElementById("graduatedTotalCount");
const graduatedWordList = document.getElementById("graduatedWordList");
const studyGraduatedButton = document.getElementById("studyGraduatedButton");
const categoryList = document.getElementById("categoryList");
const homeCarouselDots = [...document.querySelectorAll(".home-carousel-dot")];
const resumeStatusElements = {
  word: document.getElementById("wordResumeStatus"),
  grammar: document.getElementById("grammarResumeStatus"),
  conversation: document.getElementById("conversationResumeStatus"),
  review: document.getElementById("reviewResumeStatus")
};
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
const startSmartRandomButton = document.getElementById("startSmartRandomButton");
const smartRandomStatus = document.getElementById("smartRandomStatus");
const randomResumePanel = document.getElementById("randomResumePanel");
const randomResumeText = document.getElementById("randomResumeText");
const resumeSmartRandomButton = document.getElementById("resumeSmartRandomButton");
const restartSmartRandomButton = document.getElementById("restartSmartRandomButton");
const openSharedListButton = document.getElementById("openSharedListButton");
const closeSharedListButton = document.getElementById("closeSharedListButton");
const sharedOwnerCards = document.getElementById("sharedOwnerCards");
const sharedWordListArea = document.getElementById("sharedWordListArea");
const backToSharedOwnersButton = document.getElementById("backToSharedOwnersButton");
const dohyeonSharedCount = document.getElementById("dohyeonSharedCount");
const kanaSharedCount = document.getElementById("kanaSharedCount");
const allSharedCount = document.getElementById("allSharedCount");
const sharedListTitle = document.getElementById("sharedListTitle");
const sharedListSearchInput = document.getElementById("sharedListSearchInput");
const clearSharedListSearchButton = document.getElementById("clearSharedListSearchButton");
const sharedListSummary = document.getElementById("sharedListSummary");
const sharedWordList = document.getElementById("sharedWordList");

const scrollToTopButton = document.getElementById("scrollToTopButton");
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
const grammarExtraFields = document.getElementById("grammarExtraFields");
const grammarExampleInput = document.getElementById("grammarExampleInput");
const grammarExampleReadingInput = document.getElementById("grammarExampleReadingInput");
const grammarTranslationInput = document.getElementById("grammarTranslationInput");
const wordInputLabel = document.getElementById("wordInputLabel");
const readingInputLabel = document.getElementById("readingInputLabel");
const meaningInputLabel = document.getElementById("meaningInputLabel");
const bulkHelpText = document.getElementById("bulkHelpText");
const grammarParserNote = document.getElementById("grammarParserNote");
const bulkExample = document.getElementById("bulkExample");
const bulkInput = document.getElementById("bulkInput");
const saveBulkButton = document.getElementById("saveBulkButton");
const previewBulkButton = document.getElementById("previewBulkButton");
const bulkPreview = document.getElementById("bulkPreview");
const recentWordList = document.getElementById("recentWordList");
const addedBySelect = document.getElementById("addedBySelect");
const cloudStatus = document.getElementById("cloudStatus");
const repairExistingItemsButton = document.getElementById("repairExistingItemsButton");
const scanAllDuplicatesButton = document.getElementById("scanAllDuplicatesButton");
const closeDuplicateScanButton = document.getElementById("closeDuplicateScanButton");
const runDuplicateScanButton = document.getElementById("runDuplicateScanButton");
const deleteSafeDuplicatesButton = document.getElementById("deleteSafeDuplicatesButton");
const duplicateScanStatus = document.getElementById("duplicateScanStatus");
const baseDuplicateCount = document.getElementById("baseDuplicateCount");
const sharedDuplicateCount = document.getElementById("sharedDuplicateCount");
const readingDuplicateCount = document.getElementById("readingDuplicateCount");
const baseDuplicateList = document.getElementById("baseDuplicateList");
const sharedDuplicateList = document.getElementById("sharedDuplicateList");
const readingDuplicateList = document.getElementById("readingDuplicateList");
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
const grammarAnswer = document.getElementById("grammarAnswer");
const grammarCoreStage = document.getElementById("grammarCoreStage");
const grammarExampleStage = document.getElementById("grammarExampleStage");
const grammarReadingStage = document.getElementById("grammarReadingStage");
const grammarTranslationStage = document.getElementById("grammarTranslationStage");
const grammarConnection = document.getElementById("grammarConnection");
const grammarMeaning = document.getElementById("grammarMeaning");
const grammarExample = document.getElementById("grammarExample");
const grammarExampleReading = document.getElementById("grammarExampleReading");
const grammarTranslation = document.getElementById("grammarTranslation");
const wrongCountBadge = document.getElementById("wrongCountBadge");
const soundTouchArea = document.getElementById("soundTouchArea");
const graduateCurrentButton = document.getElementById("graduateCurrentButton");
const ttsSettingsButton = document.getElementById("ttsSettingsButton");
const ttsSettingsDialog = document.getElementById("ttsSettingsDialog");
const ttsSettingsForm = document.getElementById("ttsSettingsForm");
const closeTtsSettingsButton = document.getElementById("closeTtsSettingsButton");
const elevenLabsApiKeyInput = document.getElementById("elevenLabsApiKeyInput");
const loadElevenLabsVoicesButton = document.getElementById("loadElevenLabsVoicesButton");
const elevenLabsVoiceSelect = document.getElementById("elevenLabsVoiceSelect");
const elevenLabsModelSelect = document.getElementById("elevenLabsModelSelect");
const testElevenLabsVoiceButton = document.getElementById("testElevenLabsVoiceButton");
const ttsSettingsStatus = document.getElementById("ttsSettingsStatus");
const refreshBrowserVoicesButton = document.getElementById("refreshBrowserVoicesButton");
const browserVoiceSelect = document.getElementById("browserVoiceSelect");
const testBrowserVoiceButton = document.getElementById("testBrowserVoiceButton");
const saveBrowserVoiceButton = document.getElementById("saveBrowserVoiceButton");
const browserVoiceStatus = document.getElementById("browserVoiceStatus");
const browserVoiceDebugList = document.getElementById("browserVoiceDebugList");
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
const relatedWordsDialog = document.getElementById("relatedWordsDialog");
const closeRelatedWordsButton = document.getElementById("closeRelatedWordsButton");
const skipRelatedWordsButton = document.getElementById("skipRelatedWordsButton");
const addSelectedRelatedWordsButton = document.getElementById("addSelectedRelatedWordsButton");
const relatedWordsGuide = document.getElementById("relatedWordsGuide");
const relatedWordsList = document.getElementById("relatedWordsList");

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
let restoreAnswerVisible = false;
let grammarRevealStage = 0;

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


function getGraduatedMap() {
  const data = loadJson(GRADUATED_ITEMS_KEY, {});
  return data && typeof data === "object" ? data : {};
}

function getGraduationKey(item) {
  const category = item?.category || currentCategory || "word";
  return `${category}::${String(item?.id || "")}`;
}

function isGraduated(item) {
  if (!item) return false;
  return Boolean(getGraduatedMap()[getGraduationKey(item)]);
}

function setGraduated(item, graduated) {
  if (!item) return;
  const map = getGraduatedMap();
  const key = getGraduationKey(item);

  if (graduated) {
    map[key] = {
      id: String(item.id || ""),
      category: item.category || currentCategory || "word",
      graduatedAt: Date.now()
    };
  } else {
    delete map[key];
  }

  saveJson(GRADUATED_ITEMS_KEY, map);
}

function getGraduatedItems(category = "word") {
  return getAllItems().filter(item =>
    item.category === category && isGraduated(item)
  );
}

function getActiveCategoryItems(category) {
  return getCategoryItems(category).filter(item => !isGraduated(item));
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

function isKanaOnlyText(value) {
  const text = String(value || "")
    .replace(/[\s、。！？!?・ー〜～「」『』（）()…,.]/g, "");
  return Boolean(text) &&
    /[\u3040-\u30ff]/.test(text) &&
    !/[\u3400-\u9fff々〆ヵヶ]/.test(text) &&
    !containsKorean(text);
}

function mapThreeParts(parts) {
  const cleaned = parts
    .map(part => stripOuterSeparators(stripListNumber(part)))
    .map(part => String(part || "").replace(/^(?:한국어|한글|뜻|일본어|한자|히라가나|읽는\s*법)\s*[:：]\s*/i, "").trim())
    .filter(Boolean);

  const koreanIndex = cleaned.findIndex(containsKorean);
  const readingIndex = cleaned.findIndex((part, index) =>
    index !== koreanIndex && isKanaOnlyText(part)
  );
  const japaneseIndex = cleaned.findIndex((part, index) =>
    index !== koreanIndex &&
    index !== readingIndex &&
    containsJapanese(part) &&
    !containsKorean(part)
  );

  if (readingIndex >= 0 && koreanIndex >= 0 && japaneseIndex >= 0) {
    return {
      word: cleaned[japaneseIndex],
      reading: cleaned[readingIndex],
      meaning: cleaned[koreanIndex],
      autoReordered: !(japaneseIndex === 0 && readingIndex === 1 && koreanIndex === 2)
    };
  }

  return {
    word: cleaned[0] || "",
    reading: cleaned[1] || "",
    meaning: cleaned.slice(2).join(" "),
    autoReordered: false
  };
}

function normalizeImportedItem(item) {
  const original = {
    ...item,
    word: stripOuterSeparators(item.word),
    reading: stripOuterSeparators(item.reading),
    meaning: stripOuterSeparators(item.meaning),
    example: String(item.example || "").trim(),
    exampleReading: String(item.exampleReading || "").trim(),
    translation: String(item.translation || "").trim()
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

  const cleanedWord = stripListNumber(original.word);
  const cleanedReading = original.reading;
  const cleanedMeaning = String(original.meaning || "")
    .trim()
    .replace(/^[\s\-–—―·•・:：]+/, "")
    .trim();

  // 예전 데이터 중 한자와 읽는 법이 서로 뒤집혀 저장된 항목 자동 복구
  // 예: word="かくす", reading="隠す" → word="隠す", reading="かくす"
  const wordHasKana = containsKana(cleanedWord);
  const wordHasKanji = /[\u3400-\u9fff々〆ヵヶ]/.test(cleanedWord);
  const readingHasKanji = /[\u3400-\u9fff々〆ヵヶ]/.test(cleanedReading);

  if (wordHasKana && !wordHasKanji && readingHasKanji) {
    return {
      ...original,
      word: cleanedReading,
      reading: cleanedWord,
      meaning: cleanedMeaning
    };
  }

  return {
    ...original,
    word: cleanedWord,
    meaning: cleanedMeaning
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


let currentSharedOwner = "all";
let activeEditItem = null;
let activeEditSource = "study";

function normalizeOwnerName(value) {
  const name = String(value || "").trim();
  if (name === "카나" || name.includes("카나")) return "카나";
  return "도현";
}

function getSharedCloudItems() {
  return sharedItems
    .map(item => normalizeImportedItem({
      ...item,
      category: item.category || "word",
      addedBy: normalizeOwnerName(item.addedBy)
    }))
    .filter(item => item.word && item.reading && item.meaning);
}

function getSharedItemKey(item) {
  return [
    normalizeDuplicateText(item.word),
    normalizeDuplicateText(item.reading)
  ].join("::");
}

function getGroupedSharedItems(owner = "all") {
  const groups = new Map();

  getSharedCloudItems().forEach(item => {
    const itemOwner = normalizeOwnerName(item.addedBy);

    if (owner !== "all" && itemOwner !== owner) return;

    const key = getSharedItemKey(item);
    if (!groups.has(key)) {
      groups.set(key, {
        word: item.word,
        reading: item.reading,
        meanings: [],
        owners: new Set(),
        categories: new Set(),
        sourceItems: []
      });
    }

    const group = groups.get(key);
    const meaning = String(item.meaning || "").trim();

    if (meaning && !group.meanings.includes(meaning)) {
      group.meanings.push(meaning);
    }

    group.owners.add(itemOwner);
    group.categories.add(item.category || "word");
    group.sourceItems.push(item);
  });

  // 선택한 사람 목록에서도 상대방이 같은 단어를 넣었는지 표시하기 위해 전체 자료를 다시 확인
  if (owner !== "all") {
    const allItems = getSharedCloudItems();

    groups.forEach((group, key) => {
      allItems.forEach(item => {
        if (getSharedItemKey(item) !== key) return;

        const itemOwner = normalizeOwnerName(item.addedBy);
        group.owners.add(itemOwner);

        const meaning = String(item.meaning || "").trim();
        if (meaning && !group.meanings.includes(meaning)) {
          group.meanings.push(meaning);
        }
      });
    });
  }

  return [...groups.values()].sort((a, b) =>
    String(a.word).localeCompare(String(b.word), "ja")
  );
}

function updateSharedOwnerCounts() {
  const dohyeonCount = getGroupedSharedItems("도현").length;
  const kanaCount = getGroupedSharedItems("카나").length;
  const allCount = getGroupedSharedItems("all").length;

  dohyeonSharedCount.textContent = `${dohyeonCount}개`;
  kanaSharedCount.textContent = `${kanaCount}개`;
  allSharedCount.textContent = `${allCount}개`;
}

function getSharedCategoryLabel(categories) {
  return [...categories]
    .map(category => CATEGORY_NAMES[category] || category)
    .join(" · ");
}

function renderSharedWordList() {
  const query = normalizeDuplicateText(sharedListSearchInput.value);
  const ownerLabel = currentSharedOwner === "all"
    ? "도현 · 카나 전체 항목"
    : `${currentSharedOwner}이 추가한 항목`;

  sharedListTitle.textContent = ownerLabel;

  const groupedItems = getGroupedSharedItems(currentSharedOwner);
  const filteredItems = groupedItems.filter(item => {
    if (!query) return true;

    return [
      item.word,
      item.reading,
      ...item.meanings
    ].some(value => normalizeDuplicateText(value).includes(query));
  });

  sharedListSummary.textContent = query
    ? `${filteredItems.length}개 검색됨 · 전체 ${groupedItems.length}개`
    : `${groupedItems.length}개`;

  sharedWordList.innerHTML = "";

  if (filteredItems.length === 0) {
    sharedWordList.innerHTML = `
      <div class="empty-box">
        ${query ? "검색 결과가 없습니다." : "아직 추가한 항목이 없습니다."}
      </div>
    `;
    return;
  }

  filteredItems.forEach(item => {
    const owners = [...item.owners];
    const ownerText = owners.length > 1 ? "도현 · 카나" : owners[0];
    const overlapText = currentSharedOwner !== "all" && owners.length > 1
      ? `<span class="shared-overlap-badge">👥 ${currentSharedOwner === "도현" ? "카나도 추가함" : "도현도 추가함"}</span>`
      : "";

    const meaningHtml = item.meanings.length === 1
      ? `<p class="shared-item-meaning">${escapeHtml(item.meanings[0])}</p>`
      : `
        <div class="shared-meaning-variants">
          ${item.meanings.map(meaning => `<span>${escapeHtml(meaning)}</span>`).join("")}
        </div>
      `;

    const editableItems = item.sourceItems.filter((sourceItem, index, array) =>
      array.findIndex(candidate => candidate.id === sourceItem.id) === index
    );

    const editButtonsHtml = editableItems.map(sourceItem => {
      const sourceOwner = normalizeOwnerName(sourceItem.addedBy);
      const label = editableItems.length > 1 ? `✏️ ${sourceOwner}` : "✏️";

      return `
        <button
          class="shared-item-edit-button"
          type="button"
          data-shared-edit-id="${escapeHtml(sourceItem.id)}"
          aria-label="${escapeHtml(sourceOwner)} 항목 수정"
          title="${escapeHtml(sourceOwner)} 항목 수정"
        >${label}</button>
      `;
    }).join("");

    const card = document.createElement("article");
    card.className = "shared-word-card";
    card.innerHTML = `
      <div class="shared-card-edit-actions">
        ${editButtonsHtml}
      </div>

      <div class="shared-word-main">
        <strong>${escapeHtml(item.word)}</strong>
        <span>${escapeHtml(item.reading)}</span>
        ${meaningHtml}
      </div>

      <div class="shared-word-meta">
        <span>${escapeHtml(getSharedCategoryLabel(item.categories))}</span>
        <span>추가: ${escapeHtml(ownerText)}</span>
        ${overlapText}
      </div>
    `;

    card.querySelectorAll("[data-shared-edit-id]").forEach(button => {
      button.addEventListener("click", () => {
        const sourceItem = sharedItems.find(candidate =>
          candidate.id === button.dataset.sharedEditId
        );

        if (!sourceItem) {
          alert("수정할 항목을 찾지 못했습니다.");
          return;
        }

        openItemEditor(sourceItem, "sharedList");
      });
    });

    sharedWordList.appendChild(card);
  });
}

function showSharedOwnerSelection() {
  sharedOwnerCards.hidden = false;
  sharedWordListArea.hidden = true;
  sharedListSearchInput.value = "";
  updateSharedOwnerCounts();
}



let stopStudyProgressListener = null;
let progressSyncTimer = null;
let progressSyncReady = false;

function getStudyProfileName() {
  return String(addedBySelect?.value || localStorage.getItem(ADDED_BY_KEY) || "도현").trim() || "도현";
}

function mergeProgressMaps(localMap, remoteMap) {
  const merged = { ...(localMap || {}) };

  Object.entries(remoteMap || {}).forEach(([key, remoteProgress]) => {
    const localProgress = merged[key];
    if (!localProgress || Number(remoteProgress?.savedAt || 0) > Number(localProgress?.savedAt || 0)) {
      merged[key] = remoteProgress;
    }
  });

  return merged;
}

function applyRemoteStudyProgress(remoteDocument) {
  const remoteMap = remoteDocument?.progresses;
  if (!remoteMap || typeof remoteMap !== "object") {
    progressSyncReady = true;
    return;
  }

  const merged = mergeProgressMaps(getAllStudyProgress(), remoteMap);
  saveJson(STUDY_PROGRESS_KEY, merged);
  progressSyncReady = true;
  renderHome();

  if (!screens.chapter.hidden) renderChapterScreen();
}

function startStudyProgressSync() {
  if (!cloudConnected) return;

  if (stopStudyProgressListener) {
    stopStudyProgressListener();
    stopStudyProgressListener = null;
  }

  progressSyncReady = false;
  stopStudyProgressListener = listenToStudyProgress(
    getStudyProfileName(),
    applyRemoteStudyProgress,
    error => {
      console.error(error);
      progressSyncReady = true;
    }
  );
}

function queueStudyProgressSync() {
  if (!cloudConnected) return;

  window.clearTimeout(progressSyncTimer);
  progressSyncTimer = window.setTimeout(async () => {
    try {
      await saveStudyProgress(getStudyProfileName(), getAllStudyProgress());
    } catch (error) {
      console.error("이어하기 위치 동기화 실패:", error);
    }
  }, 450);
}

function getAllStudyProgress() {
  const saved = loadJson(STUDY_PROGRESS_KEY, {});
  return saved && typeof saved === "object" ? saved : {};
}

function getStudyProgressKey(category = currentCategory, chapter = selectedChapter) {
  return `${category}::${chapter}`;
}

function getChapterProgress(category, chapter) {
  return getAllStudyProgress()[getStudyProgressKey(category, chapter)] || null;
}

function saveChapterProgress() {
  if (studyMode !== "chapter" || currentItems.length === 0) return;

  const allProgress = getAllStudyProgress();
  allProgress[getStudyProgressKey()] = {
    category: currentCategory,
    chapter: selectedChapter,
    currentIndex,
    roundNumber,
    currentItemIds: currentItems.map(item => item.id),
    nextRoundItemIds: nextRoundItems.map(item => item.id),
    answerVisible: !answerElement.hidden,
    grammarRevealStage: currentCategory === "grammar" ? grammarRevealStage : 0,
    savedAt: Date.now()
  };
  saveJson(STUDY_PROGRESS_KEY, allProgress);
  queueStudyProgressSync();
}

function clearChapterProgress(category = currentCategory, chapter = selectedChapter) {
  const allProgress = getAllStudyProgress();
  delete allProgress[getStudyProgressKey(category, chapter)];
  saveJson(STUDY_PROGRESS_KEY, allProgress);
  queueStudyProgressSync();
}

function rebuildItemsFromIds(ids, category) {
  const itemMap = new Map(
    getCategoryItems(category).map(item => [String(item.id), item])
  );

  return (Array.isArray(ids) ? ids : [])
    .map(id => itemMap.get(String(id)))
    .filter(item => Boolean(item) && !isGraduated(item));
}

function resumeChapterProgress(progress) {
  const restoredItems = rebuildItemsFromIds(progress.currentItemIds, progress.category);

  if (restoredItems.length === 0) {
    clearChapterProgress(progress.category, progress.chapter);
    return false;
  }

  currentCategory = progress.category;
  selectedChapter = Number(progress.chapter);
  studyMode = "chapter";
  currentItems = restoredItems;
  nextRoundItems = rebuildItemsFromIds(progress.nextRoundItemIds, progress.category);
  currentIndex = Math.min(
    Math.max(0, Number(progress.currentIndex) || 0),
    currentItems.length - 1
  );
  roundNumber = Math.max(1, Number(progress.roundNumber) || 1);
  restoreAnswerVisible = Boolean(progress.answerVisible);
  grammarRevealStage = progress.category === "grammar"
    ? Math.max(0, Math.min(4, Number(progress.grammarRevealStage) || 0))
    : 0;

  showScreen("study");
  showCurrentItem();
  return true;
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
    .filter(item => !isGraduated(item) && getWrongCount(item.id) >= ANNOYING_LIMIT)
    .sort((a, b) => getWrongCount(b.id) - getWrongCount(a.id));
}


function updateHomeCarouselDots() {
  if (!categoryList || homeCarouselDots.length === 0) return;

  const cards = [...categoryList.querySelectorAll(".category-book")];
  if (cards.length === 0) return;

  const center = categoryList.scrollLeft + categoryList.clientWidth / 2;
  let activeIndex = 0;
  let closestDistance = Infinity;

  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(cardCenter - center);

    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  homeCarouselDots.forEach((dot, index) => {
    const active = index === activeIndex;
    dot.classList.toggle("active", active);
    dot.setAttribute("aria-current", active ? "true" : "false");
  });
}

function scrollHomeCarouselTo(index) {
  if (!categoryList) return;

  const cards = [...categoryList.querySelectorAll(".category-book")];
  const target = cards[index];
  if (!target) return;

  target.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center"
  });
}

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.hidden = true);
  screens[name].hidden = false;
  window.scrollTo(0, 0);
  window.setTimeout(updateScrollToTopButton, 0);
}

function renderHome() {
  wordCategoryCount.textContent = `${getCategoryItems("word").length}개`;
  grammarCategoryCount.textContent = `${getCategoryItems("grammar").length}개`;
  conversationCategoryCount.textContent = `${getCategoryItems("conversation").length}개`;
  reviewCategoryCount.textContent = `${getCategoryItems("review").length}개`;
  if (randomWordCount) randomWordCount.textContent = `${getCategoryItems("word").length}개 등록`;
  if (randomReviewCount) randomReviewCount.textContent = `${getCategoryItems("review").length}개 등록`;
  updateSharedOwnerCounts();
  requestAnimationFrame(updateHomeCarouselDots);

  Object.entries(resumeStatusElements).forEach(([category, element]) => {
    if (!element) return;

    const progresses = Object.values(getAllStudyProgress())
      .filter(progress => progress.category === category)
      .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0));

    const latest = progresses[0];

    if (!latest) {
      element.hidden = true;
      element.textContent = "";
      return;
    }

    const total = Array.isArray(latest.currentItemIds) ? latest.currentItemIds.length : 0;
    const position = Math.min((Number(latest.currentIndex) || 0) + 1, total);

    element.textContent = `▶ 제 ${latest.chapter}장 ${position} / ${total}`;
    element.hidden = false;
  });
}



function getCurrentPageScrollTop() {
  const windowTop =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

  const visibleScreen = [...document.querySelectorAll(".screen, .study-screen")]
    .find(screen => !screen.hidden);

  const screenTop = visibleScreen ? Number(visibleScreen.scrollTop || 0) : 0;
  return Math.max(windowTop, screenTop);
}

function updateScrollToTopButton() {
  if (!scrollToTopButton) return;

  const shouldShow = getCurrentPageScrollTop() > 320;
  scrollToTopButton.hidden = !shouldShow;
  scrollToTopButton.classList.toggle("visible", shouldShow);
}

function scrollEveryActiveViewToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollingElement = document.scrollingElement;
  if (scrollingElement) {
    scrollingElement.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(
    ".screen, .study-screen, .list, .chapter-list, .bulk-preview-list, .unresolved-list"
  ).forEach(element => {
    if (element.scrollTop > 0) {
      element.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  window.setTimeout(updateScrollToTopButton, 450);
}

scrollToTopButton?.addEventListener("click", scrollEveryActiveViewToTop);

// window 스크롤과 내부 화면 스크롤을 모두 감지합니다.
window.addEventListener("scroll", updateScrollToTopButton, { passive: true });
document.addEventListener("scroll", updateScrollToTopButton, {
  passive: true,
  capture: true
});

window.addEventListener("resize", updateScrollToTopButton);


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
  const activeItems = items.filter(item => !isGraduated(item));
  const categoryName = CATEGORY_NAMES[currentCategory];
  const chapterSize = getChapterSize(currentCategory);

  categoryTitle.textContent = categoryName;
  categoryTotalCount.textContent = activeItems.length;
  annoyingMenuCount.textContent = `${getAnnoyingItems().length}개`;
  graduatedMenuCount.textContent = `${getGraduatedItems("word").length}개`;
  openGraduatedButton.hidden = currentCategory !== "word";

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
    const remainingInPlan = items.slice(plan.start, plan.end)
      .filter(item => !isGraduated(item)).length;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "chapter-card";

    if (plan.type === "review") {
      card.innerHTML = `
        <span class="chapter-name">제 ${plan.chapter}장 · 복습</span>
        <strong>${plan.rangeStart} ~ ${plan.rangeEnd}</strong>
        <small>졸업 제외 ${remainingInPlan}개 복습<br>시작할 때마다 순서가 랜덤으로 바뀝니다</small>
      `;
    } else {
      card.innerHTML = `
        <span class="chapter-name">제 ${plan.chapter}장</span>
        <strong>${plan.rangeStart} ~ ${plan.rangeEnd}</strong>
        <small>졸업 제외 ${remainingInPlan}개 학습<br>${categoryName} 기준 장당 최대 ${chapterSize}개</small>
      `;
    }

    const progress = getChapterProgress(currentCategory, plan.chapter);

    if (progress) {
      const total = Array.isArray(progress.currentItemIds) ? progress.currentItemIds.length : 0;
      const position = Math.min((Number(progress.currentIndex) || 0) + 1, total);

      const resumeRow = document.createElement("span");
      resumeRow.className = "chapter-resume-row";
      resumeRow.innerHTML = `
        <b>▶ 이어하기 ${position} / ${total}</b>
        <button type="button" class="chapter-restart-button">처음부터</button>
      `;

      resumeRow.querySelector(".chapter-restart-button").addEventListener("click", event => {
        event.stopPropagation();
        clearChapterProgress(currentCategory, plan.chapter);
        startChapter(plan.chapter, true);
      });

      card.appendChild(resumeRow);
    }

    if (remainingInPlan === 0) {
      card.classList.add("chapter-card-empty");
      card.disabled = true;
      const emptyNote = document.createElement("small");
      emptyNote.className = "chapter-empty-note";
      emptyNote.textContent = "이 장의 모든 항목을 졸업했습니다";
      card.appendChild(emptyNote);
    } else {
      card.addEventListener("click", () => startChapter(plan.chapter));
    }
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


let latestDuplicateScan = {
  baseDuplicates: [],
  sharedDuplicates: [],
  readingDuplicates: [],
  safeDeleteIds: []
};

function normalizeDuplicateReading(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .replace(/[\s　・･\-ー]/g, "")
    .toLocaleLowerCase("ja");
}

function getExactDuplicateKey(item) {
  return [
    item.category || "word",
    normalizeDuplicateText(item.word),
    normalizeDuplicateReading(item.reading)
  ].join("::");
}

function getWordDuplicateKey(item) {
  return [
    item.category || "word",
    normalizeDuplicateText(item.word)
  ].join("::");
}

function createFullDuplicateReport() {
  const baseItems = defaultWords.map(item => ({
    ...item,
    category: "word",
    source: "base"
  }));

  const cloudItems = sharedItems
    .map(item => ({
      ...normalizeImportedItem(item),
      id: item.id,
      category: item.category || "word",
      addedBy: item.addedBy || "이름 없음",
      source: "cloud"
    }))
    .filter(item => item.word && item.reading && item.meaning);

  const baseByWord = new Map();
  const baseByExact = new Map();

  baseItems.forEach(item => {
    baseByWord.set(getWordDuplicateKey(item), item);
    baseByExact.set(getExactDuplicateKey(item), item);
  });

  const baseDuplicates = [];
  const sharedDuplicates = [];
  const readingDuplicates = [];
  const safeDeleteIds = [];

  cloudItems.forEach(item => {
    const exactBase = baseByExact.get(getExactDuplicateKey(item));
    const sameWordBase = baseByWord.get(getWordDuplicateKey(item));

    if (exactBase || sameWordBase) {
      const baseItem = exactBase || sameWordBase;
      const exact = Boolean(exactBase);

      baseDuplicates.push({
        baseItem,
        cloudItem: item,
        exact,
        reason: exact
          ? "한자와 읽기가 모두 같은 확실한 중복"
          : "한자는 같고 읽기 또는 뜻이 다른 항목"
      });

      if (exact && item.id) safeDeleteIds.push(String(item.id));
    }
  });

  const groupedByExact = new Map();

  cloudItems.forEach(item => {
    const key = getExactDuplicateKey(item);
    if (!groupedByExact.has(key)) groupedByExact.set(key, []);
    groupedByExact.get(key).push(item);
  });

  groupedByExact.forEach(group => {
    if (group.length < 2) return;

    const keep = group[0];
    const duplicates = group.slice(1);

    sharedDuplicates.push({
      keep,
      duplicates,
      exact: true
    });

    duplicates.forEach(item => {
      if (item.id) safeDeleteIds.push(String(item.id));
    });
  });

  const readingGroups = new Map();

  cloudItems
    .filter(item => (item.category || "word") === "word")
    .forEach(item => {
      const readingKey = normalizeDuplicateReading(item.reading);
      if (!readingKey) return;
      if (!readingGroups.has(readingKey)) readingGroups.set(readingKey, []);
      readingGroups.get(readingKey).push(item);
    });

  readingGroups.forEach(group => {
    const uniqueWords = new Set(group.map(item => normalizeDuplicateText(item.word)));
    if (group.length >= 2 && uniqueWords.size >= 2) {
      readingDuplicates.push({
        reading: group[0].reading,
        items: group
      });
    }
  });

  return {
    baseDuplicates,
    sharedDuplicates,
    readingDuplicates,
    safeDeleteIds: [...new Set(safeDeleteIds)]
  };
}

function makeDuplicateRow(item, extraHtml = "", deleteHandler = null) {
  const row = document.createElement("div");
  row.className = "list-item duplicate-result-item";
  row.innerHTML = `
    <div class="recent-item-content">
      <strong>${escapeHtml(item.word)}</strong>
      <span class="recent-item-reading">${escapeHtml(item.reading)}</span>
      <span class="recent-item-meaning">${escapeHtml(item.meaning)}</span>
      ${extraHtml}
    </div>
    ${deleteHandler ? '<button class="recent-delete-button" type="button">삭제</button>' : ""}
  `;

  if (deleteHandler) {
    row.querySelector(".recent-delete-button").addEventListener("click", deleteHandler);
  }

  return row;
}

async function deleteDuplicateItem(id) {
  if (!id) return;
  if (!confirm("이 중복 항목을 공유 단어장에서 삭제할까요?")) return;

  try {
    await removeSharedItem(id);
    duplicateScanStatus.textContent = "삭제 완료 · 목록을 다시 검사합니다.";
    window.setTimeout(renderDuplicateScan, 250);
  } catch (error) {
    console.error(error);
    alert("삭제하지 못했습니다. 인터넷 연결을 확인해 주세요.");
  }
}

function renderDuplicateScan() {
  if (!cloudConnected) {
    duplicateScanStatus.textContent = "공유 단어장 연결이 끝난 뒤 다시 검사해 주세요.";
    return;
  }

  latestDuplicateScan = createFullDuplicateReport();

  baseDuplicateCount.textContent = latestDuplicateScan.baseDuplicates.length;
  sharedDuplicateCount.textContent = latestDuplicateScan.sharedDuplicates
    .reduce((sum, group) => sum + group.duplicates.length, 0);
  readingDuplicateCount.textContent = latestDuplicateScan.readingDuplicates.length;

  deleteSafeDuplicatesButton.disabled = latestDuplicateScan.safeDeleteIds.length === 0;

  baseDuplicateList.innerHTML = "";
  sharedDuplicateList.innerHTML = "";
  readingDuplicateList.innerHTML = "";

  if (latestDuplicateScan.baseDuplicates.length === 0) {
    baseDuplicateList.innerHTML = '<div class="empty-box">기본 단어와 겹치는 추가 단어가 없습니다.</div>';
  } else {
    latestDuplicateScan.baseDuplicates.forEach(result => {
      const extra = `
        <small class="duplicate-reason ${result.exact ? "safe" : "review"}">
          ${escapeHtml(result.reason)} · 기본 뜻: ${escapeHtml(result.baseItem.meaning)}
        </small>
      `;
      baseDuplicateList.appendChild(
        makeDuplicateRow(
          result.cloudItem,
          extra,
          result.cloudItem.id ? () => deleteDuplicateItem(result.cloudItem.id) : null
        )
      );
    });
  }

  if (latestDuplicateScan.sharedDuplicates.length === 0) {
    sharedDuplicateList.innerHTML = '<div class="empty-box">추가 단어끼리의 확실한 중복이 없습니다.</div>';
  } else {
    latestDuplicateScan.sharedDuplicates.forEach(group => {
      group.duplicates.forEach(item => {
        const extra = `
          <small class="duplicate-reason safe">
            같은 단어를 ${group.duplicates.length + 1}번 저장함 · 남길 항목: ${escapeHtml(group.keep.addedBy || "이름 없음")}
          </small>
        `;
        sharedDuplicateList.appendChild(
          makeDuplicateRow(item, extra, () => deleteDuplicateItem(item.id))
        );
      });
    });
  }

  if (latestDuplicateScan.readingDuplicates.length === 0) {
    readingDuplicateList.innerHTML = '<div class="empty-box">읽기만 같은 다른 단어가 없습니다.</div>';
  } else {
    latestDuplicateScan.readingDuplicates.forEach(group => {
      const box = document.createElement("article");
      box.className = "reading-duplicate-group";
      box.innerHTML = `
        <strong>${escapeHtml(group.reading)}</strong>
        <div>
          ${group.items.map(item =>
            `<span>${escapeHtml(item.word)} · ${escapeHtml(item.meaning)}</span>`
          ).join("")}
        </div>
      `;
      readingDuplicateList.appendChild(box);
    });
  }

  const exactBaseCount = latestDuplicateScan.baseDuplicates.filter(item => item.exact).length;
  const sharedExactCount = latestDuplicateScan.sharedDuplicates
    .reduce((sum, group) => sum + group.duplicates.length, 0);

  duplicateScanStatus.textContent =
    `검사 완료 · 확실한 자동 삭제 후보 ${latestDuplicateScan.safeDeleteIds.length}개` +
    ` (기본 중복 ${exactBaseCount}개, 추가 단어 중복 ${sharedExactCount}개)`;
}

async function deleteAllSafeDuplicates() {
  const ids = latestDuplicateScan.safeDeleteIds;

  if (ids.length === 0) {
    alert("자동 삭제할 확실한 중복이 없습니다.");
    return;
  }

  if (!confirm(
    `한자와 읽기가 같은 확실한 중복 ${ids.length}개를 전부 삭제할까요?\n` +
    `읽기만 같은 다른 단어는 삭제하지 않습니다.`
  )) return;

  deleteSafeDuplicatesButton.disabled = true;
  deleteSafeDuplicatesButton.textContent = "삭제 중…";

  let deleted = 0;
  let failed = 0;

  for (const id of ids) {
    try {
      await removeSharedItem(id);
      deleted += 1;
    } catch (error) {
      console.error(error);
      failed += 1;
    }
  }

  deleteSafeDuplicatesButton.textContent = "확실한 중복 모두 삭제";
  duplicateScanStatus.textContent = `삭제 완료 ${deleted}개 · 실패 ${failed}개`;

  window.setTimeout(renderDuplicateScan, 400);
}

scanAllDuplicatesButton?.addEventListener("click", () => {
  showScreen("duplicateScan");
  renderDuplicateScan();
});

closeDuplicateScanButton?.addEventListener("click", () => {
  configureAddScreenForCategory();
  renderRecentItems();
  showScreen("add");
});

runDuplicateScanButton?.addEventListener("click", renderDuplicateScan);
deleteSafeDuplicatesButton?.addEventListener("click", deleteAllSafeDuplicates);

function renderRecentItems() {
  const items = sharedItems
    .filter(item => (item.category || "word") === currentCategory)
    .map(item => ({
      ...normalizeImportedItem(item),
      id: item.id,
      shared: true,
      category: item.category || "word",
      addedBy: item.addedBy || "도현"
    }));
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
    row.className = "list-item recent-shared-item";
    row.innerHTML = `
      <div class="recent-item-content">
        <strong>${escapeHtml(item.word)}</strong>
        <span class="recent-item-reading">${escapeHtml(item.reading)}</span>
        <span class="recent-item-meaning">${escapeHtml(item.meaning)}</span>
        <small class="added-by">추가: ${escapeHtml(item.addedBy || "이름 없음")}</small>
      </div>

      <div class="recent-item-actions">
        <button class="recent-edit-button" type="button" aria-label="항목 수정" title="항목 수정">✏️</button>
        <button class="recent-delete-button" type="button">삭제</button>
      </div>
    `;

    row.querySelector(".recent-edit-button").addEventListener("click", () => {
      openItemEditor(item, "recentList");
    });

    row.querySelector(".recent-delete-button").addEventListener("click", () => {
      deleteItem(item.id);
    });

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

function configureAddScreenForCategory() {
  const isConversation = currentCategory === "conversation";
  const isGrammar = currentCategory === "grammar";
  screens.add.classList.toggle("conversation-add", isConversation);
  grammarExtraFields.hidden = !isGrammar;
  if (grammarParserNote) grammarParserNote.hidden = !isGrammar;

  if (isConversation) {
    wordInputLabel.textContent = "일본어 문장";
    readingInputLabel.textContent = "히라가나";
    meaningInputLabel.textContent = "한국어 문장";

    wordInput.placeholder = "例) 今日、何したの？";
    readingInput.placeholder = "例) きょう、なにしたの？";
    meaningInput.placeholder = "예) 오늘 뭐 했어?";

    bulkHelpText.textContent =
      "한국어·일본어·히라가나 라벨, 번호, 구분선, 빈 줄을 자동 제거합니다. 순서가 뒤섞여도 문자 종류를 보고 자동 정리합니다.";
    bulkExample.textContent =
`今日、何したの？
きょう、なにしたの？
오늘 뭐 했어?

지금 어디야? / 今どこ？ / いまどこ？

1. なんじにあおうか？
何時に会おうか？
몇 시에 만날까?`;
  } else if (isGrammar) {
    wordInputLabel.textContent = "문형";
    readingInputLabel.textContent = "접속";
    meaningInputLabel.textContent = "뜻";

    wordInput.placeholder = "例) ～からして";
    readingInput.placeholder = "例) 명사 + からして";
    meaningInput.placeholder = "예) ~부터, ~만 봐도";

    bulkHelpText.textContent =
      "문법은 반드시 ‘문형: 내용’처럼 한 줄씩 입력합니다. 문법 하나가 끝나면 빈 줄을 넣고 다음 문형을 시작하세요.";
    bulkExample.textContent =
`문형: ～からして
접속: 명사 + からして
뜻: ~부터, ~만 봐도
예문: この映画はタイトルからして面白そうだ。
히라가나: このえいがはタイトルからしておもしろそうだ。
해석: 이 영화는 제목부터 재미있을 것 같다.`;
  } else {
    wordInputLabel.textContent = "일본어";
    readingInputLabel.textContent = "읽는 법";
    meaningInputLabel.textContent = "한국어 뜻";

    wordInput.placeholder = "例) 食堂";
    readingInput.placeholder = "例) しょくどう";
    meaningInput.placeholder = "例) 식당";

    bulkHelpText.textContent = "라벨·번호·구분선·빈 줄을 자동 제거합니다. 3줄·하이픈·파이프 형식도 모두 인식합니다.";
    bulkExample.textContent =
`勝ち目
かちめ
승산

分解 - ぶんかい - 분해

競争|きょうそう|경쟁`;
  }
}


function getUsefulRelatedWords(word) {
  if (currentCategory !== "word") return [];

  const existing = new Set(
    getCategoryItems("word").map(item => normalizeDuplicateText(item.word))
  );

  return (RELATED_WORDS[String(word || "").trim()] || [])
    .filter(item => !existing.has(normalizeDuplicateText(item.word)))
    .slice(0, 2);
}

function closeRelatedWordsDialog() {
  relatedWordsDialog.hidden = true;
  document.body.classList.remove("dialog-open");
  pendingRelatedWords = [];
  relatedSourceWord = "";
}

function showRelatedWordsDialog(sourceWord) {
  const suggestions = getUsefulRelatedWords(sourceWord);
  if (suggestions.length === 0) return false;

  relatedSourceWord = sourceWord;
  pendingRelatedWords = suggestions;
  relatedWordsGuide.textContent =
    `「${sourceWord}」와 함께 외울 가치가 높은 단어만 골랐습니다.`;

  relatedWordsList.innerHTML = suggestions.map((item, index) => `
    <label class="related-word-option">
      <input type="checkbox" value="${index}" checked>
      <span>
        <strong>${escapeHtml(item.word)}</strong>
        <em>${escapeHtml(item.reading)}</em>
        <b>${escapeHtml(item.meaning)}</b>
        <small>${escapeHtml(item.reason)}</small>
      </span>
    </label>
  `).join("");

  relatedWordsDialog.hidden = false;
  document.body.classList.add("dialog-open");
  return true;
}

async function addSelectedRelatedWords() {
  const selectedIndexes = [...relatedWordsList.querySelectorAll('input[type="checkbox"]:checked')]
    .map(input => Number(input.value))
    .filter(Number.isInteger);

  const selected = selectedIndexes
    .map(index => pendingRelatedWords[index])
    .filter(Boolean)
    .filter(item => !isDuplicate(item.word, getCategoryItems("word")));

  if (selected.length === 0) {
    closeRelatedWordsDialog();
    return;
  }

  addSelectedRelatedWordsButton.disabled = true;
  addSelectedRelatedWordsButton.textContent = "추가 중…";

  try {
    await addSharedItems(selected.map(item => ({
      category: "word",
      word: item.word,
      reading: item.reading,
      meaning: item.meaning,
      addedBy: addedBySelect.value
    })));

    alert(`${selected.length}개 연관 단어를 추가했습니다.`);
    closeRelatedWordsDialog();
  } catch (error) {
    console.error(error);
    alert("연관 단어를 추가하지 못했습니다.");
  } finally {
    addSelectedRelatedWordsButton.disabled = false;
    addSelectedRelatedWordsButton.textContent = "선택한 단어 추가";
  }
}

closeRelatedWordsButton?.addEventListener("click", closeRelatedWordsDialog);
skipRelatedWordsButton?.addEventListener("click", closeRelatedWordsDialog);
addSelectedRelatedWordsButton?.addEventListener("click", addSelectedRelatedWords);
relatedWordsDialog?.addEventListener("click", event => {
  if (event.target === relatedWordsDialog) closeRelatedWordsDialog();
});

singleForm.addEventListener("submit", async event => {
  event.preventDefault();

  const word = wordInput.value.trim();
  const reading = readingInput.value.trim();
  const meaning = meaningInput.value.trim();
  const example = currentCategory === "grammar" ? grammarExampleInput.value.trim() : "";
  const exampleReading = currentCategory === "grammar" ? grammarExampleReadingInput.value.trim() : "";
  const translation = currentCategory === "grammar" ? grammarTranslationInput.value.trim() : "";

  if (!word || !reading || !meaning) return;

  if (currentCategory === "grammar" && (!example || !exampleReading || !translation)) {
    alert("문법은 문형·접속·뜻·예문·히라가나·해석을 모두 입력해 주세요.");
    return;
  }

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
      example,
      exampleReading,
      translation,
      addedBy: addedBySelect.value
    });

    singleForm.reset();

    if (!showRelatedWordsDialog(word)) {
      alert("두 사람의 공유 단어장에 저장됐습니다.");
    }
  } catch (error) {
    console.error(error);
    alert("저장하지 못했습니다. 인터넷 연결을 확인해 주세요.");
  }
});


const SMART_PASTE_LABELS = new Set([
  "단어", "한자", "일본어", "일본어표현", "표현",
  "히라가나", "읽는법", "읽기", "요미가나",
  "뜻", "의미", "한국어뜻", "한국어", "한글",
  "문형", "접속", "예문", "예문히라가나", "해석",
  "일본어문장", "한국어문장"
]);

function normalizeSmartPasteLabel(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .replace(/[\s　]+/g, "")
    .replace(/^[【\[\(（〈《「『]+|[】\]\)）〉》」』:：]+$/g, "")
    .toLowerCase();
}

function isSmartPasteLabel(line) {
  const normalized = normalizeSmartPasteLabel(line);
  return SMART_PASTE_LABELS.has(normalized);
}

function isSmartPasteSeparator(line) {
  const value = String(line || "").trim();
  if (!value) return false;

  return (
    /^[~〜～_\-—–―=＊*·•・□■◆◇○●◆▽▼△▲─━]{3,}$/.test(value)
    || /^[\s~〜～_\-—–―=＊*·•・□■◆◇○●◆▽▼△▲─━]+$/.test(value)
  );
}

function stripSmartPasteDecorations(line) {
  return String(line || "")
    .normalize("NFKC")
    .trim()
    .replace(/^\s*(?:\d+|[①-⑳])\s*[.)、:：\-]?\s*/, "")
    .replace(/^[【\[\(（〈《「『]\s*/, "")
    .replace(/\s*[】\]\)）〉》」』]\s*$/, "")
    .trim();
}



function expandInlineSmartPasteLabels(rawText) {
  const labelPattern = /^(단어|한자|일본어(?:\s*표현|\s*문장)?|표현|히라가나|읽는\s*법|읽기|요미가나|뜻|의미|한국어(?:\s*뜻|\s*문장)?|한글|문형|접속|예문(?:\s*히라가나)?|해석|번역)\s*[:：]\s*(.*)$/i;

  return String(rawText || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map(line => {
      const match = line.trim().match(labelPattern);
      return match ? `${match[1]}\n${match[2]}` : line;
    })
    .join("\n");
}

function preprocessSmartPaste(rawText) {
  return String(rawText || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map(stripSmartPasteDecorations)
    .filter(line => line && !isSmartPasteSeparator(line) && !isSmartPasteLabel(line))
    .join("\n");
}

function splitSmartPasteBlocks(rawText) {
  const normalized = String(rawText || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const rawBlocks = normalized
    .split(/\n\s*\n+/)
    .map(block => preprocessSmartPaste(block))
    .filter(Boolean);

  return rawBlocks;
}

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




function normalizeGrammarLabel(line) {
  const normalized = normalizeSmartPasteLabel(line);

  const aliases = {
    "문형": "word",
    "접속": "reading",
    "뜻": "meaning",
    "의미": "meaning",
    "예문": "example",
    "히라가나": "exampleReading",
    "예문히라가나": "exampleReading",
    "해석": "translation",
    "번역": "translation"
  };

  return aliases[normalized] || "";
}

function parseInlineLabelLine(line) {
  const match = String(line || "").trim().match(
    /^(문형|접속|뜻|의미|예문|히라가나|예문\s*히라가나|해석|번역|단어|한자|일본어(?:\s*문장)?|한국어(?:\s*문장)?|읽는\s*법|읽기)\s*[:：]\s*(.*)$/i
  );

  if (!match) return null;

  return {
    label: match[1],
    field: normalizeGrammarLabel(match[1]),
    value: match[2].trim()
  };
}

function parseGrammarBulkItems(rawText) {
  const lines = String(rawText || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map(line => stripSmartPasteDecorations(line))
    .filter(line => line && !isSmartPasteSeparator(line));

  const items = [];
  const errors = [];
  let current = null;

  function emptyItem() {
    return {
      word: "",
      reading: "",
      meaning: "",
      example: "",
      exampleReading: "",
      translation: "",
      autoReordered: false
    };
  }

  function finish(lineNumber) {
    if (!current) return;

    const required = [
      ["문형", "word"],
      ["접속", "reading"],
      ["뜻", "meaning"],
      ["예문", "example"],
      ["히라가나", "exampleReading"],
      ["해석", "translation"]
    ];

    const missing = required
      .filter(([, field]) => !String(current[field] || "").trim())
      .map(([label]) => label);

    if (missing.length) {
      errors.push({
        lineNumber,
        text: current.word || "(문형 없음)",
        reason: `${missing.join(", ")} 항목이 없습니다.`
      });
    } else {
      items.push(current);
    }

    current = null;
  }

  lines.forEach((line, index) => {
    const parsed = parseInlineLabelLine(line);

    if (!parsed || !parsed.field) {
      errors.push({
        lineNumber: index + 1,
        text: line,
        reason: "문법은 ‘문형: 내용’처럼 한 줄 형식으로 입력해 주세요."
      });
      return;
    }

    if (parsed.field === "word") {
      finish(index + 1);
      current = emptyItem();
    } else if (!current) {
      current = emptyItem();
    }

    current[parsed.field] = parsed.value;
  });

  finish(lines.length + 1);
  return { items, errors };
}

function normalizeSimpleInlineLabel(label) {
  const normalized = normalizeSmartPasteLabel(label);
  const map = {
    "단어": "word",
    "한자": "word",
    "일본어": "word",
    "일본어표현": "word",
    "표현": "word",
    "일본어문장": "word",
    "히라가나": "reading",
    "읽는법": "reading",
    "읽기": "reading",
    "요미가나": "reading",
    "뜻": "meaning",
    "의미": "meaning",
    "한국어뜻": "meaning",
    "한국어": "meaning",
    "한글": "meaning",
    "한국어문장": "meaning"
  };
  return map[normalized] || "";
}

function parseSimpleInlineItems(rawText) {
  const blocks = String(rawText || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split(/\n\s*\n+/)
    .map(block => block.trim())
    .filter(Boolean);

  const items = [];
  const errors = [];
  let matchedAny = false;

  blocks.forEach((block, blockIndex) => {
    const item = { word: "", reading: "", meaning: "", autoReordered: false };
    const lines = block.split("\n").map(line => line.trim()).filter(Boolean);

    lines.forEach(line => {
      const match = line.match(
        /^(단어|한자|일본어(?:\s*표현|\s*문장)?|표현|히라가나|읽는\s*법|읽기|요미가나|뜻|의미|한국어(?:\s*뜻|\s*문장)?|한글)\s*[:：]\s*(.*)$/i
      );
      if (!match) return;

      const field = normalizeSimpleInlineLabel(match[1]);
      if (!field) return;

      matchedAny = true;
      item[field] = match[2].trim();
    });

    if (item.word || item.reading || item.meaning) {
      if (item.word && item.reading && item.meaning) {
        items.push(item);
      } else {
        errors.push({
          lineNumber: blockIndex + 1,
          text: block,
          reason: "일본어·히라가나·한국어 중 빠진 항목이 있습니다."
        });
      }
    }
  });

  return matchedAny ? { items, errors } : null;
}

function parseBulkItems(rawText) {
  if (/^\s*(문형|접속|예문|해석)\s*[:：]/m.test(String(rawText || ""))) {
    return parseGrammarBulkItems(rawText);
  }

  const inlineResult = parseSimpleInlineItems(rawText);
  if (inlineResult) return inlineResult;

  const cleanedText = preprocessSmartPaste(rawText);
  const lines = cleanedText.split("\n")
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

      ${currentCategory === "grammar" ? `
      <label>문형<input class="bulk-edit-input" data-field="word" value="${escapeHtml(item.word)}"></label>
      <label>접속<input class="bulk-edit-input" data-field="reading" value="${escapeHtml(item.reading)}"></label>
      <label>뜻<input class="bulk-edit-input" data-field="meaning" value="${escapeHtml(item.meaning)}"></label>
      <label>예문<textarea class="bulk-edit-input" data-field="example" rows="2">${escapeHtml(item.example || "")}</textarea></label>
      <label>히라가나<textarea class="bulk-edit-input" data-field="exampleReading" rows="2">${escapeHtml(item.exampleReading || "")}</textarea></label>
      <label>해석<textarea class="bulk-edit-input" data-field="translation" rows="2">${escapeHtml(item.translation || "")}</textarea></label>
      ` : currentCategory === "conversation" ? `
      <label>
        한국어 문장
        <input class="bulk-edit-input" data-field="meaning" value="${escapeHtml(item.meaning)}" autocomplete="off">
      </label>
      <label>
        일본어 문장
        <input class="bulk-edit-input" data-field="word" value="${escapeHtml(item.word)}" autocomplete="off">
      </label>
      <label>
        히라가나
        <input class="bulk-edit-input" data-field="reading" value="${escapeHtml(item.reading)}" autocomplete="off">
      </label>
      ` : `
      <label>
        일본어 한자·표현
        <input class="bulk-edit-input" data-field="word" value="${escapeHtml(item.word)}" autocomplete="off">
      </label>
      <label>
        읽는 법
        <input class="bulk-edit-input" data-field="reading" value="${escapeHtml(item.reading)}" autocomplete="off">
      </label>
      <label>
        한국어 뜻
        <input class="bulk-edit-input" data-field="meaning" value="${escapeHtml(item.meaning)}" autocomplete="off">
      </label>
      `}
    </article>
  `).join("");

  const reorderedCount = lastBulkPreview.items.filter(item => item.autoReordered).length;

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
      <span>순서 자동 수정 ${reorderedCount}개 · 형식 오류 ${lastBulkPreview.errors.length}개</span>
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
  const allComplete = lastBulkPreview.items.every(item => {
    const basicComplete =
      String(item.word || "").trim() &&
      String(item.reading || "").trim() &&
      String(item.meaning || "").trim();

    if (!basicComplete) return false;
    if (currentCategory !== "grammar") return true;

    return (
      String(item.example || "").trim() &&
      String(item.exampleReading || "").trim() &&
      String(item.translation || "").trim()
    );
  });

  saveBulkButton.disabled = !(hasItems && allComplete);
}

function parseBulkInputByCurrentCategory(rawText) {
  if (currentCategory === "grammar") {
    return parseGrammarBulkItems(rawText);
  }

  return parseBulkItems(rawText);
}

previewBulkButton.addEventListener("click", () => {
  if (!bulkInput.value.trim()) {
    alert("먼저 내용을 붙여넣어 주세요.");
    return;
  }

  renderBulkPreview(parseBulkInputByCurrentCategory(bulkInput.value));
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
      word: String(item.word || "").trim(),
      reading: String(item.reading || "").trim(),
      meaning: String(item.meaning || "").trim(),
      example: String(item.example || "").trim(),
      exampleReading: String(item.exampleReading || "").trim(),
      translation: String(item.translation || "").trim()
    };

    if (!cleanedItem.word || !cleanedItem.reading || !cleanedItem.meaning) {
      return;
    }

    if (
      currentCategory === "grammar"
      && (!cleanedItem.example || !cleanedItem.exampleReading || !cleanedItem.translation)
    ) {
      return;
    }

    const key = normalizeDuplicateText(cleanedItem.word);
    if (!key) {
      duplicateCount += 1;
      return;
    }

    if (existingKeys.has(key) && currentCategory !== "grammar") {
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
    const saveLabel = currentCategory === "grammar" ? "문법 저장·갱신" : "공유 저장";
    alert(`${saveLabel} ${itemsToSave.length}개\n중복 제외 ${duplicateCount}개\n형식 오류 ${lastBulkPreview.errors.length}개`);

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
  startStudyProgressSync();
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
  const pool = getRandomReviewPool();
  const history = getRandomReviewHistory();
  const seenCount = Math.min(history.length, pool.length);
  const remaining = Math.max(0, pool.length - seenCount);
  const progress = getRandomReviewProgress();

  if (smartRandomStatus) {
    smartRandomStatus.textContent = pool.length === 0
      ? "등록된 단어가 없습니다."
      : remaining === 0
        ? `총 ${pool.length}개 한 바퀴 완료 · 다음에는 새 순서로 시작`
        : `전체 ${pool.length}개 · 아직 안 본 단어 ${remaining}개`;
  }

  if (progress && Array.isArray(progress.currentItemIds) && progress.currentItemIds.length > 0) {
    const total = progress.currentItemIds.length;
    const position = Math.min((Number(progress.currentIndex) || 0) + 1, total);

    randomResumePanel.hidden = false;
    randomResumeText.textContent = `▶ 이어하기 ${position} / ${total}`;
    startSmartRandomButton.hidden = true;
  } else {
    randomResumePanel.hidden = true;
    startSmartRandomButton.hidden = false;
  }

  startSmartRandomButton.disabled = pool.length === 0;
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



function getRandomReviewProgress() {
  const saved = loadJson(RANDOM_REVIEW_PROGRESS_KEY, null);
  return saved && typeof saved === "object" ? saved : null;
}

function saveRandomReviewProgress() {
  if (studyMode !== "random" || currentItems.length === 0) return;

  saveJson(RANDOM_REVIEW_PROGRESS_KEY, {
    currentIndex,
    roundNumber,
    currentItemIds: currentItems.map(item => item.id),
    nextRoundItemIds: nextRoundItems.map(item => item.id),
    answerVisible: !answerElement.hidden,
    savedAt: Date.now()
  });
}

function clearRandomReviewProgress() {
  localStorage.removeItem(RANDOM_REVIEW_PROGRESS_KEY);
}

function rebuildRandomItemsFromIds(ids) {
  const itemMap = new Map(
    getRandomReviewPool().map(item => [String(item.id), item])
  );

  return (Array.isArray(ids) ? ids : [])
    .map(id => itemMap.get(String(id)))
    .filter(item => Boolean(item) && !isGraduated(item));
}

function resumeRandomReview() {
  const progress = getRandomReviewProgress();
  if (!progress) return false;

  const restoredItems = rebuildRandomItemsFromIds(progress.currentItemIds);
  if (restoredItems.length === 0) {
    clearRandomReviewProgress();
    return false;
  }

  currentCategory = "word";
  studyMode = "random";
  currentItems = restoredItems;
  nextRoundItems = rebuildRandomItemsFromIds(progress.nextRoundItemIds);
  currentIndex = Math.min(
    Math.max(0, Number(progress.currentIndex) || 0),
    currentItems.length - 1
  );
  roundNumber = Math.max(1, Number(progress.roundNumber) || 1);
  randomRequestedCount = currentItems.length;
  restoreAnswerVisible = Boolean(progress.answerVisible);

  showScreen("study");
  showCurrentItem();
  return true;
}

function getRandomReviewPool() {
  const wordItems = getCategoryItems("word");
  const reviewItems = getCategoryItems("review");
  const unique = new Map();

  [...wordItems, ...reviewItems].forEach(item => {
    const key = `${normalizeDuplicateText(item.word)}::${normalizeDuplicateText(item.reading)}`;
    if (!unique.has(key)) unique.set(key, item);
  });

  return [...unique.values()].filter(item => !isGraduated(item));
}

function getRandomReviewHistory() {
  const saved = loadJson(RANDOM_REVIEW_HISTORY_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

function saveRandomReviewHistory(ids) {
  saveJson(RANDOM_REVIEW_HISTORY_KEY, ids);
}

function getSmartRandomReviewItems(count = 50) {
  const pool = getRandomReviewPool();

  if (pool.length === 0) return [];

  const history = new Set(getRandomReviewHistory().map(String));
  let unseen = pool.filter(item => !history.has(String(item.id)));

  // 한 바퀴를 다 돌았으면 기록을 초기화하고 새 순서로 다시 시작
  if (unseen.length === 0) {
    history.clear();
    unseen = [...pool];
  }

  const selected = [];

  // 아직 안 본 단어를 우선 선택
  selected.push(...shuffleItems(unseen).slice(0, Math.min(count, unseen.length)));

  // 마지막 묶음이 50개보다 적으면 이전에 본 단어에서 부족한 만큼 채움
  if (selected.length < count) {
    const selectedIds = new Set(selected.map(item => String(item.id)));
    const fillers = shuffleItems(
      pool.filter(item => !selectedIds.has(String(item.id)))
    ).slice(0, count - selected.length);

    selected.push(...fillers);
  }

  return selected;
}

function completeSmartRandomReview(items) {
  const pool = getRandomReviewPool();
  const poolIds = new Set(pool.map(item => String(item.id)));
  const history = new Set(
    getRandomReviewHistory()
      .map(String)
      .filter(id => poolIds.has(id))
  );

  items.forEach(item => history.add(String(item.id)));

  // 전체 단어를 한 번씩 다 봤다면 다음 시작을 위해 기록 초기화
  if (pool.length > 0 && history.size >= pool.length) {
    saveRandomReviewHistory([]);
  } else {
    saveRandomReviewHistory([...history]);
  }
}

function startRandomStudy(count = 50, forceNew = false) {
  if (!forceNew && getRandomReviewProgress() && resumeRandomReview()) {
    return;
  }

  clearRandomReviewProgress();

  const items = getSmartRandomReviewItems(50);

  if (items.length === 0) {
    alert("단어 또는 N5~N3 추가단어에 등록된 항목이 없습니다.");
    return;
  }

  currentCategory = "word";
  randomRequestedCount = items.length;
  studyMode = "random";
  startStudy(items);
}

function startChapter(chapter, forceRestart = false) {
  const items = getCategoryItems(currentCategory);
  const plan = getChapterPlans(currentCategory, items.length)
    .find(candidate => candidate.chapter === chapter);

  if (!plan) {
    alert("이 장을 불러오지 못했습니다.");
    return;
  }

  const savedProgress = getChapterProgress(currentCategory, chapter);

  if (!forceRestart && savedProgress && resumeChapterProgress(savedProgress)) {
    return;
  }

  if (forceRestart) {
    clearChapterProgress(currentCategory, chapter);
  }

  const chapterItems = items.slice(plan.start, plan.end)
    .filter(item => !isGraduated(item));

  if (chapterItems.length === 0) {
    alert("이 장의 모든 단어를 졸업했습니다.");
    renderChapterScreen();
    return;
  }

  studyMode = "chapter";
  selectedChapter = chapter;
  startStudy(shuffleItems(chapterItems));
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
  restoreAnswerVisible = false;
  grammarRevealStage = 0;

  showScreen("study");
  showCurrentItem();
}

function getCurrentItem() {
  return currentItems[currentIndex];
}


function updateGrammarReveal() {
  const visible = grammarRevealStage > 0;
  answerElement.hidden = !visible;

  grammarCoreStage.hidden = !visible;
  grammarExampleStage.hidden = !visible;
  grammarReadingStage.hidden = !visible;
  grammarTranslationStage.hidden = !visible;

  meaningButton.textContent = visible ? "전부 확인" : "뜻 보기";
}

function showCurrentItem() {
  const item = getCurrentItem();

  if (!item) {
    finishStudy();
    return;
  }

  const categoryName = CATEGORY_NAMES[currentCategory];

  studyTitle.textContent = studyMode === "graduated"
    ? `🎓 졸업 단어 복습 ${roundNumber}회독`
    : studyMode === "annoying"
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

  const isConversation = currentCategory === "conversation";
  const isGrammar = currentCategory === "grammar";

  grammarAnswer.hidden = true;
  readingElement.hidden = false;
  meaningElement.hidden = false;

  if (isConversation) {
    wordElement.textContent = item.meaning;
    readingElement.textContent = item.word;
    meaningElement.textContent = item.reading;
    wordElement.classList.add("conversation-prompt");
    readingElement.classList.add("conversation-japanese");
    meaningElement.classList.add("conversation-reading");
    meaningButton.textContent = restoreAnswerVisible ? "일본어 확인" : "일본어 보기";
    knowButton.textContent = "✓ 말할 수 있음";
  } else if (isGrammar) {
    wordElement.textContent = item.word;
    readingElement.hidden = true;
    meaningElement.hidden = true;
    grammarAnswer.hidden = false;

    grammarConnection.textContent = item.reading || "";
    grammarMeaning.textContent = item.meaning || "";
    grammarExample.textContent = item.example || "예문이 아직 없습니다.";
    grammarExample.setAttribute("role", "button");
    grammarExample.setAttribute("tabindex", "0");
    grammarExample.setAttribute("aria-label", "예문 일본어 음성 재생");
    grammarExample.title = "눌러서 예문 듣기";
    grammarExampleReading.textContent = item.exampleReading || "히라가나가 아직 없습니다.";
    grammarTranslation.textContent = item.translation || "해석이 아직 없습니다.";

    grammarRevealStage = restoreAnswerVisible ? 4 : 0;
    updateGrammarReveal();
    knowButton.textContent = "✓ 알겠음";
  } else {
    wordElement.textContent = item.word;
    readingElement.textContent = item.reading;
    meaningElement.textContent = item.meaning;
    wordElement.classList.remove("conversation-prompt");
    readingElement.classList.remove("conversation-japanese");
    meaningElement.classList.remove("conversation-reading");
    meaningButton.textContent = restoreAnswerVisible ? "뜻 확인" : "뜻 보기";
    knowButton.textContent = "✓ 알고 있음";
  }

  editCurrentButton.hidden = !item.shared;

  const canUseGraduation = currentCategory === "word";
  graduateCurrentButton.hidden = !canUseGraduation;
  graduateCurrentButton.textContent = studyMode === "graduated" ? "↩️" : "🎓";
  graduateCurrentButton.setAttribute(
    "aria-label",
    studyMode === "graduated" ? "졸업 취소" : "현재 단어 졸업"
  );

  if (currentCategory !== "grammar") {
    answerElement.hidden = !restoreAnswerVisible;
  }
  restoreAnswerVisible = false;

  saveChapterProgress();

  const count = getWrongCount(item.id);
  wrongCountBadge.textContent = `공부하겠음 ${count}회`;
  wrongCountBadge.classList.toggle("angry", count >= ANNOYING_LIMIT);

  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  saveChapterProgress();
  saveRandomReviewProgress();
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

  if (studyMode === "chapter") {
    clearChapterProgress();
  }

  if (studyMode === "random") {
    completeSmartRandomReview(currentItems);
    clearRandomReviewProgress();
  }

  completeTitle.textContent = studyMode === "graduated"
    ? "🎓 졸업 단어 복습 완료!"
    : studyMode === "annoying"
      ? `${categoryName} 복습 완료!`
    : studyMode === "search"
      ? `${categoryName} 확인 완료!`
      : studyMode === "random"
        ? `${categoryName} 랜덤복습 완료!`
        : `${categoryName} 제 ${selectedChapter}장 완료!`;

  completeMessage.textContent = studyMode === "random"
    ? `${currentItems.length}개 랜덤복습을 마쳤습니다. 다음에는 다른 단어를 우선 보여줍니다.`
    : `${roundNumber}회독까지 진행했습니다.`;
  renderHome();
  showScreen("complete");
}

meaningButton.addEventListener("click", () => {
  if (currentCategory === "grammar") {
    grammarRevealStage = 4;
    updateGrammarReveal();
    saveChapterProgress();
    saveRandomReviewProgress();
    return;
  }

  if (answerElement.hidden) {
    answerElement.hidden = false;
    meaningButton.textContent = currentCategory === "conversation"
      ? "일본어 확인"
      : "뜻 확인";
    saveChapterProgress();
    saveRandomReviewProgress();
  }
});


function openItemEditor(item, source = "study") {
  if (!item || !item.shared) {
    alert("직접 추가한 항목만 수정할 수 있습니다.");
    return;
  }

  activeEditItem = item;
  activeEditSource = source;

  editWordInput.value = item.word || "";
  editReadingInput.value = item.reading || "";
  editMeaningInput.value = item.meaning || "";
  editItemOwner.textContent = `추가한 사람: ${item.addedBy || "이름 없음"}`;
  editItemDialog.hidden = false;
  document.body.classList.add("dialog-open");

  setTimeout(() => editWordInput.focus(), 50);
}

function openCurrentItemEditor() {
  openItemEditor(getCurrentItem(), "study");
}

function closeCurrentItemEditor() {
  editItemDialog.hidden = true;
  document.body.classList.remove("dialog-open");
  activeEditItem = null;
  activeEditSource = "study";
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

  const item = activeEditItem || getCurrentItem();
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

    if (activeEditSource === "study") {
      currentItems[currentIndex] = updatedItem;
      nextRoundItems = nextRoundItems.map(roundItem =>
        roundItem.id === item.id ? updatedItem : roundItem
      );
    }

    const editSource = activeEditSource;
    closeCurrentItemEditor();

    if (editSource === "sharedList") {
      renderSharedWordList();
    } else if (editSource === "recentList") {
      renderRecentItems();
    } else {
      showCurrentItem();
    }
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

const ELEVENLABS_SETTINGS_KEY = "jpAppElevenLabsV13";
const elevenAudioCache = new Map();
let activeElevenAudio = null;

function getElevenLabsSettings() {
  try {
    return {
      apiKey: "",
      voiceId: "",
      voiceName: "",
      modelId: "eleven_flash_v2_5",
      ...JSON.parse(localStorage.getItem(ELEVENLABS_SETTINGS_KEY) || "{}")
    };
  } catch {
    return { apiKey: "", voiceId: "", voiceName: "", modelId: "eleven_flash_v2_5" };
  }
}

function saveElevenLabsSettings(settings) {
  localStorage.setItem(ELEVENLABS_SETTINGS_KEY, JSON.stringify(settings));
}

const BROWSER_VOICE_KEY = "jpAppSelectedBrowserVoiceV172";

function getBrowserVoiceId(voice) {
  return `${voice.name || ""}::${voice.lang || ""}::${voice.voiceURI || ""}`;
}

function getJapaneseBrowserVoices() {
  return (window.speechSynthesis?.getVoices?.() || [])
    .filter(voice => String(voice.lang || "").toLowerCase().startsWith("ja"));
}

function getSavedBrowserVoiceId() {
  return localStorage.getItem(BROWSER_VOICE_KEY) || "";
}

function chooseAutomaticJapaneseVoice(voices) {
  const checks = [
    voice => /siri.*voice\s*1|siri.*1|音声\s*1/i.test(String(voice.name || "")),
    voice => /otoya|オトヤ/i.test(String(voice.name || "")) &&
      /premium|enhanced|高品質/i.test(String(voice.name || "")),
    voice => /otoya|オトヤ/i.test(String(voice.name || "")),
    voice => /siri/i.test(String(voice.name || "")),
    voice => /kyoko|キョウコ/i.test(String(voice.name || "")),
    voice => voice.default
  ];

  for (const check of checks) {
    const voice = voices.find(check);
    if (voice) return voice;
  }

  return voices[0] || null;
}

function getSelectedBrowserVoice() {
  const voices = getJapaneseBrowserVoices();
  if (voices.length === 0) return null;

  const savedId = getSavedBrowserVoiceId();
  if (savedId) {
    const savedVoice = voices.find(voice => getBrowserVoiceId(voice) === savedId);
    if (savedVoice) return savedVoice;
  }

  return chooseAutomaticJapaneseVoice(voices);
}

function waitForJapaneseBrowserVoices(timeoutMs = 2200) {
  return new Promise(resolve => {
    const startedAt = Date.now();

    function check() {
      const voices = getJapaneseBrowserVoices();

      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        resolve([]);
        return;
      }

      window.setTimeout(check, 120);
    }

    check();
  });
}

async function playBrowserJapanese(text, explicitVoice = null) {
  if (!("speechSynthesis" in window)) return false;

  await waitForJapaneseBrowserVoices();

  const voice = explicitVoice || getSelectedBrowserVoice();
  if (!voice) {
    if (browserVoiceStatus) {
      browserVoiceStatus.textContent = "Safari에서 사용할 수 있는 일본어 음성을 찾지 못했습니다.";
    }
    return false;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.voice = voice;
  speech.lang = "ja-JP";
  speech.rate = 0.92;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);

  if (browserVoiceStatus) {
    browserVoiceStatus.textContent = `현재 재생 음성: ${voice.name}`;
  }

  return true;
}

async function renderBrowserVoiceOptions() {
  if (!browserVoiceSelect) return;

  browserVoiceStatus.textContent = "Safari 음성 목록을 확인하고 있습니다…";
  const voices = await waitForJapaneseBrowserVoices();

  const savedId = getSavedBrowserVoiceId();
  browserVoiceSelect.innerHTML = '<option value="">자동 선택</option>';

  voices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = getBrowserVoiceId(voice);
    option.textContent =
      `${index + 1}. ${voice.name} · ${voice.lang}${voice.default ? " · 기본" : ""}`;
    option.selected = option.value === savedId;
    browserVoiceSelect.appendChild(option);
  });

  browserVoiceDebugList.textContent = voices.length
    ? voices.map((voice, index) =>
        `${index + 1}. 이름: ${voice.name}\n   언어: ${voice.lang}\n   URI: ${voice.voiceURI || "없음"}\n   기본: ${voice.default ? "예" : "아니오"}`
      ).join("\n\n")
    : "Safari가 일본어 음성을 하나도 반환하지 않았습니다.";

  const currentVoice = getSelectedBrowserVoice();

  browserVoiceStatus.textContent = voices.length
    ? `일본어 음성 ${voices.length}개 인식 · 현재: ${currentVoice?.name || "자동"}`
    : "일본어 음성을 인식하지 못했습니다.";
}

function getVoiceFromBrowserSelect() {
  const selectedId = browserVoiceSelect?.value || "";
  if (!selectedId) return getSelectedBrowserVoice();

  return getJapaneseBrowserVoices().find(
    voice => getBrowserVoiceId(voice) === selectedId
  ) || null;
}

async function requestElevenLabsAudio(text, settings) {
  const cacheKey = `${settings.voiceId}::${settings.modelId}::${text}`;
  if (elevenAudioCache.has(cacheKey)) return elevenAudioCache.get(cacheKey);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(settings.voiceId)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": settings.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: settings.modelId,
        language_code: "ja",
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.78,
          style: 0.08,
          use_speaker_boost: true,
          speed: 0.92
        }
      })
    }
  );

  if (!response.ok) {
    let detail = "";
    try { detail = JSON.stringify(await response.json()); } catch { detail = await response.text(); }
    throw new Error(`ElevenLabs ${response.status}: ${detail}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  elevenAudioCache.set(cacheKey, objectUrl);
  return objectUrl;
}

async function playElevenLabsText(text, { allowFallback = true } = {}) {
  const settings = getElevenLabsSettings();

  if (!settings.apiKey || !settings.voiceId) {
    if (allowFallback) {
      await playBrowserJapanese(text);
      ttsSettingsStatus.textContent = "ElevenLabs 설정이 없어 아이폰 기본 음성으로 재생했습니다.";
    }
    return false;
  }

  try {
    soundButton.disabled = true;
    soundButton.textContent = "…";

    if (activeElevenAudio) {
      activeElevenAudio.pause();
      activeElevenAudio.currentTime = 0;
    }

    const audioUrl = await requestElevenLabsAudio(text, settings);
    activeElevenAudio = new Audio(audioUrl);
    activeElevenAudio.preload = "auto";
    await activeElevenAudio.play();
    return true;
  } catch (error) {
    console.error("ElevenLabs 재생 실패:", error);
    if (allowFallback) {
      await playBrowserJapanese(text);
      alert("ElevenLabs 음성을 불러오지 못해서 아이폰 기본 음성으로 재생했습니다.\n설정의 API 키와 목소리를 확인해 주세요.");
    }
    return false;
  } finally {
    soundButton.disabled = false;
    soundButton.textContent = "🔊";
  }
}

async function playSound() {
  const item = getCurrentItem();
  if (!item) return;
  const speechText = String(item.word || item.reading || "").trim();
  if (!speechText) return;
  await playElevenLabsText(speechText);
}

function openTtsSettings() {
  renderBrowserVoiceOptions();
  const settings = getElevenLabsSettings();
  elevenLabsApiKeyInput.value = settings.apiKey || "";
  elevenLabsModelSelect.value = settings.modelId || "eleven_flash_v2_5";
  elevenLabsVoiceSelect.innerHTML = settings.voiceId
    ? `<option value="${escapeHtml(settings.voiceId)}">${escapeHtml(settings.voiceName || settings.voiceId)}</option>`
    : '<option value="">먼저 목소리를 불러오세요</option>';
  ttsSettingsStatus.textContent = settings.voiceId
    ? `현재 목소리: ${settings.voiceName || settings.voiceId}`
    : "API 키를 넣고 목소리 불러오기를 누르세요.";
  ttsSettingsDialog.showModal();
}

async function loadElevenLabsVoices() {
  const apiKey = elevenLabsApiKeyInput.value.trim();
  if (!apiKey) {
    alert("ElevenLabs API 키를 먼저 붙여넣어 주세요.");
    return;
  }

  loadElevenLabsVoicesButton.disabled = true;
  loadElevenLabsVoicesButton.textContent = "불러오는 중…";
  ttsSettingsStatus.textContent = "목소리 목록을 불러오고 있습니다.";

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey }
    });
    if (!response.ok) throw new Error(`목소리 조회 실패 (${response.status})`);

    const data = await response.json();
    const voices = Array.isArray(data.voices) ? data.voices : [];
    const saved = getElevenLabsSettings();

    elevenLabsVoiceSelect.innerHTML = voices.map(voice => {
      const labels = voice.labels || {};
      const details = [labels.gender, labels.age, labels.accent, labels.description]
        .filter(Boolean).join(" · ");
      return `<option value="${escapeHtml(voice.voice_id)}" ${voice.voice_id === saved.voiceId ? "selected" : ""}>${escapeHtml(voice.name)}${details ? ` · ${escapeHtml(details)}` : ""}</option>`;
    }).join("");

    if (!voices.length) throw new Error("사용 가능한 목소리가 없습니다.");
    ttsSettingsStatus.textContent = `${voices.length}개 목소리를 불러왔습니다. 남성 목소리를 골라 테스트해 보세요.`;
  } catch (error) {
    console.error(error);
    ttsSettingsStatus.textContent = "불러오지 못했습니다. API 키 권한에서 Text to Speech와 Voices Read를 확인해 주세요.";
    alert("목소리를 불러오지 못했습니다. API 키와 권한을 확인해 주세요.");
  } finally {
    loadElevenLabsVoicesButton.disabled = false;
    loadElevenLabsVoicesButton.textContent = "목소리 불러오기";
  }
}

refreshBrowserVoicesButton?.addEventListener("click", renderBrowserVoiceOptions);

testBrowserVoiceButton?.addEventListener("click", async () => {
  const voice = getVoiceFromBrowserSelect();

  if (!voice) {
    alert("테스트할 일본어 음성을 찾지 못했습니다.");
    return;
  }

  testBrowserVoiceButton.disabled = true;
  testBrowserVoiceButton.textContent = "재생 중…";
  await playBrowserJapanese("こんにちは。日本語の勉強を始めましょう。", voice);
  window.setTimeout(() => {
    testBrowserVoiceButton.disabled = false;
    testBrowserVoiceButton.textContent = "선택 음성 테스트";
  }, 900);
});

saveBrowserVoiceButton?.addEventListener("click", () => {
  const selectedId = browserVoiceSelect?.value || "";

  if (selectedId) {
    localStorage.setItem(BROWSER_VOICE_KEY, selectedId);
    const voice = getVoiceFromBrowserSelect();
    browserVoiceStatus.textContent = `기본 음성 저장 완료: ${voice?.name || "선택 음성"}`;
  } else {
    localStorage.removeItem(BROWSER_VOICE_KEY);
    browserVoiceStatus.textContent = "자동 선택으로 저장했습니다.";
  }

  alert("아이폰 기본 음성 설정을 저장했습니다.");
});

if ("speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    if (ttsSettingsDialog?.open) renderBrowserVoiceOptions();
  });
}

ttsSettingsButton.addEventListener("click", openTtsSettings);
closeTtsSettingsButton.addEventListener("click", () => ttsSettingsDialog.close());
loadElevenLabsVoicesButton.addEventListener("click", loadElevenLabsVoices);

ttsSettingsForm.addEventListener("submit", event => {
  event.preventDefault();
  const selectedOption = elevenLabsVoiceSelect.selectedOptions[0];
  const settings = {
    apiKey: elevenLabsApiKeyInput.value.trim(),
    voiceId: elevenLabsVoiceSelect.value,
    voiceName: selectedOption?.textContent || "",
    modelId: elevenLabsModelSelect.value
  };

  if (!settings.apiKey || !settings.voiceId) {
    alert("API 키와 목소리를 모두 선택해 주세요.");
    return;
  }

  saveElevenLabsSettings(settings);
  ttsSettingsDialog.close();
  alert("ElevenLabs 목소리 설정을 저장했습니다.");
});

testElevenLabsVoiceButton.addEventListener("click", async () => {
  const selectedOption = elevenLabsVoiceSelect.selectedOptions[0];
  const temporarySettings = {
    apiKey: elevenLabsApiKeyInput.value.trim(),
    voiceId: elevenLabsVoiceSelect.value,
    voiceName: selectedOption?.textContent || "",
    modelId: elevenLabsModelSelect.value
  };

  if (!temporarySettings.apiKey || !temporarySettings.voiceId) {
    alert("API 키를 입력하고 목소리를 선택해 주세요.");
    return;
  }

  const previousSettings = getElevenLabsSettings();
  saveElevenLabsSettings(temporarySettings);
  testElevenLabsVoiceButton.disabled = true;
  testElevenLabsVoiceButton.textContent = "재생 중…";
  const success = await playElevenLabsText("こんにちは。日本語の勉強を始めましょう。", { allowFallback: false });
  if (!success) alert("테스트에 실패했습니다. 다른 목소리나 모델을 선택해 보세요.");
  saveElevenLabsSettings(previousSettings);
  testElevenLabsVoiceButton.disabled = false;
  testElevenLabsVoiceButton.textContent = "테스트";
});



async function playCurrentGrammarExample(event) {
  if (event) event.stopPropagation();
  if (currentCategory !== "grammar") return;

  const item = getCurrentItem();
  const exampleText = String(item?.example || "").trim();
  if (!exampleText) return;

  grammarExample.classList.add("is-speaking");

  try {
    await playElevenLabsText(exampleText);
  } finally {
    window.setTimeout(() => {
      grammarExample.classList.remove("is-speaking");
    }, 500);
  }
}

grammarExample?.addEventListener("click", playCurrentGrammarExample);
grammarExample?.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  playCurrentGrammarExample(event);
});

soundTouchArea.addEventListener("click", event => {
  // 버튼이나 입력 요소를 누른 경우에는 발음을 재생하지 않음
  if (event.target.closest("button, input, select, textarea, a")) return;
  playSound();
});

studyAgainButton.addEventListener("click", () => {
  const item = getCurrentItem();
  if (!item) return;

  increaseWrongCount(item.id);
  nextRoundItems.push(item);
  nextItem();
});

knowButton.addEventListener("click", nextItem);


function removeCurrentGraduatedItemFromStudy() {
  const removedItem = currentItems[currentIndex];
  if (!removedItem) return;

  currentItems.splice(currentIndex, 1);
  nextRoundItems = nextRoundItems.filter(item =>
    String(item.id) !== String(removedItem.id)
  );

  if (currentIndex >= currentItems.length) {
    currentIndex = Math.max(0, currentItems.length - 1);
  }

  if (currentItems.length === 0) {
    finishStudy();
    return;
  }

  showCurrentItem();
}

function graduateCurrentItem() {
  const item = getCurrentItem();
  if (!item || currentCategory !== "word") return;

  if (studyMode === "graduated") {
    if (!confirm(`「${item.word}」을(를) 일반 단어장으로 복귀시킬까요?`)) return;
    setGraduated(item, false);
    removeCurrentGraduatedItemFromStudy();
    renderGraduatedWords();
    return;
  }

  if (!confirm(`「${item.word}」을(를) 졸업 단어로 이동할까요?\n일반 장·복습·랜덤에서 바로 제외됩니다.`)) {
    return;
  }

  setGraduated(item, true);
  const total = getGraduatedItems("word").length;
  alert(`🎉 졸업 완료!\n현재 졸업 단어 ${total}개`);
  removeCurrentGraduatedItemFromStudy();
}

graduateCurrentButton?.addEventListener("click", event => {
  event.stopPropagation();
  graduateCurrentItem();
});

function renderGraduatedWords() {
  const items = getGraduatedItems("word");
  graduatedTotalCount.textContent = items.length;
  graduatedWordList.innerHTML = "";
  studyGraduatedButton.disabled = items.length === 0;

  if (items.length === 0) {
    graduatedWordList.innerHTML =
      '<div class="empty-box">공부 화면의 🎓 버튼을 누르면 여기에 모입니다.</div>';
    return;
  }

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "list-item graduated-list-item";
    row.innerHTML = `
      <div class="recent-item-content">
        <strong>${escapeHtml(item.word)}</strong>
        <span class="recent-item-reading">${escapeHtml(item.reading)}</span>
        <span class="recent-item-meaning">${escapeHtml(item.meaning)}</span>
      </div>
      <button type="button" class="graduate-restore-button">복귀</button>
    `;

    row.querySelector(".graduate-restore-button").addEventListener("click", () => {
      setGraduated(item, false);
      renderGraduatedWords();
    });

    graduatedWordList.appendChild(row);
  });
}

function startGraduatedStudy() {
  const items = getGraduatedItems("word");

  if (items.length === 0) {
    alert("졸업 단어가 없습니다.");
    return;
  }

  currentCategory = "word";
  studyMode = "graduated";
  startStudy(shuffleItems(items));
}

openGraduatedButton?.addEventListener("click", () => {
  renderGraduatedWords();
  showScreen("graduated");
});

closeGraduatedButton?.addEventListener("click", () => {
  currentCategory = "word";
  renderChapterScreen();
  showScreen("chapter");
});

studyGraduatedButton?.addEventListener("click", startGraduatedStudy);

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
      <div class="recent-item-content">
        <strong>${escapeHtml(item.word)}</strong>
        <span class="recent-item-reading">${escapeHtml(item.reading)}</span>
        <span class="recent-item-meaning">${escapeHtml(item.meaning)}</span>
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

openSharedListButton.addEventListener("click", () => {
  showSharedOwnerSelection();
  showScreen("sharedList");
});

closeSharedListButton.addEventListener("click", () => {
  showScreen("home");
});

document.querySelectorAll("[data-shared-owner]").forEach(button => {
  button.addEventListener("click", () => {
    currentSharedOwner = button.dataset.sharedOwner;
    sharedOwnerCards.hidden = true;
    sharedWordListArea.hidden = false;
    sharedListSearchInput.value = "";
    renderSharedWordList();
  });
});

backToSharedOwnersButton.addEventListener("click", () => {
  showSharedOwnerSelection();
});

sharedListSearchInput.addEventListener("input", renderSharedWordList);

clearSharedListSearchButton.addEventListener("click", () => {
  sharedListSearchInput.value = "";
  renderSharedWordList();
  sharedListSearchInput.focus();
});

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

if (categoryList) {
  let homeCarouselFrame = null;

  categoryList.addEventListener("scroll", () => {
    if (homeCarouselFrame) cancelAnimationFrame(homeCarouselFrame);

    homeCarouselFrame = requestAnimationFrame(() => {
      updateHomeCarouselDots();
      homeCarouselFrame = null;
    });
  }, { passive: true });
}

homeCarouselDots.forEach(dot => {
  dot.addEventListener("click", () => {
    scrollHomeCarouselTo(Number(dot.dataset.homeSlide));
  });
});

openRandomButton.addEventListener("click", () => {
  renderRandomScreen();
  showScreen("random");
});

closeRandomButton.addEventListener("click", () => {
  renderHome();
  showScreen("home");
});

if (startSmartRandomButton) {
  startSmartRandomButton.addEventListener("click", () => {
    startRandomStudy(50, true);
  });
}

if (resumeSmartRandomButton) {
  resumeSmartRandomButton.addEventListener("click", () => {
    if (!resumeRandomReview()) {
      renderRandomScreen();
      alert("이어갈 랜덤복습 기록이 없습니다.");
    }
  });
}

if (restartSmartRandomButton) {
  restartSmartRandomButton.addEventListener("click", () => {
    if (!confirm("현재 랜덤복습 진행을 지우고 새로운 50개로 시작할까요?")) return;
    clearRandomReviewProgress();
    startRandomStudy(50, true);
  });
}

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
  configureAddScreenForCategory();
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
  saveChapterProgress();
  saveRandomReviewProgress();

  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  showScreen("home");
  renderHome();
}

// ☰는 학습 메뉴 전용.
// 오른쪽 X는 현재 위치를 저장하고 현재 카테고리의 장 선택 화면으로 돌아갑니다.
closeStudyButton.addEventListener("click", () => {
  saveChapterProgress();
  saveRandomReviewProgress();

  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  // 랜덤복습 중이었다면 랜덤복습 화면으로, 일반 장 학습 중이면 장 선택 화면으로 이동
  if (studyMode === "random") {
    renderRandomScreen();
    showScreen("random");
    return;
  }

  if (studyMode === "graduated") {
    renderGraduatedWords();
    showScreen("graduated");
    return;
  }

  renderChapterScreen();
  showScreen("chapter");
});

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
        : "자동 정리 완료 · 목록을 정상 형식으로 다시 표시했습니다.";
      repairExistingItemsStatus.textContent = message;
      renderRecentItems();

      if (!screens.sharedList.hidden) {
        updateSharedOwnerCounts();
        if (!sharedWordListArea.hidden) renderSharedWordList();
      }

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
    renderRecentItems();

    if (!screens.sharedList.hidden) {
      updateSharedOwnerCounts();
      if (!sharedWordListArea.hidden) renderSharedWordList();
    }

    if (showResult) {
      alert(`${repairedCount}개 항목을 자동 복구했습니다.${unresolvedText}\n읽는 법과 뜻 표시도 새 형식으로 갱신했습니다.`);
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
    repairExistingItemsStatus.textContent = unresolvedCount > 0
      ? `자동 판별이 어려운 항목 ${unresolvedCount}개가 남아 있습니다.`
      : "데이터 정리 완료 · 목록 표시도 새 형식으로 갱신했습니다.";

    renderRecentItems();

    if (!screens.sharedList.hidden) {
      updateSharedOwnerCounts();
      if (!sharedWordListArea.hidden) renderSharedWordList();
    }

    alert(
      unresolvedCount > 0
        ? `자동 판별이 어려운 항목 ${unresolvedCount}개가 남아 있습니다. 미확정 항목에서 확인해 주세요.`
        : "자동 정리가 끝났습니다. 읽는 법과 뜻 사이의 ·, - 표시는 이제 나오지 않습니다."
    );
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
        if (firstConnection) startStudyProgressSync();

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
        if (!screens.duplicateScan.hidden) renderDuplicateScan();
        if (!screens.sharedList.hidden) {
          updateSharedOwnerCounts();
          if (!sharedWordListArea.hidden) renderSharedWordList();
        }

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

document.addEventListener("visibilitychange", () => {
  if (document.hidden && !screens.study.hidden) {
    saveChapterProgress();
    saveRandomReviewProgress();
  }
});

window.addEventListener("pagehide", () => {
  if (!screens.study.hidden) {
    saveChapterProgress();
    saveRandomReviewProgress();
  }
});

renderHome();
showScreen("home");
startCloudSync();


document.addEventListener("DOMContentLoaded", () => {
  const sheet = document.getElementById("studyMenuSheet");
  const drawer = sheet?.querySelector(".study-menu-drawer");
  const menuButton = document.getElementById("exitStudyButton");
  const closeButton = document.getElementById("menuClose");
  const backdrop = document.getElementById("studyMenuBackdrop");

  function openStudyMenu() {
    if (!sheet) return;
    sheet.hidden = false;
    document.body.classList.add("study-menu-open");
    requestAnimationFrame(() => {
      sheet.classList.add("open");
      drawer?.focus?.();
    });
  }

  function closeStudyMenu() {
    if (!sheet) return;
    sheet.classList.remove("open");
    document.body.classList.remove("study-menu-open");
    window.setTimeout(() => {
      if (!sheet.classList.contains("open")) sheet.hidden = true;
    }, 260);
  }

  menuButton?.addEventListener("click", event => {
    event.preventDefault();
    openStudyMenu();
  });

  closeButton?.addEventListener("click", closeStudyMenu);
  backdrop?.addEventListener("click", closeStudyMenu);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && sheet && !sheet.hidden) closeStudyMenu();
  });

  document.getElementById("menuResume")?.addEventListener("click", closeStudyMenu);

  document.getElementById("menuRestart")?.addEventListener("click", () => {
    if (!confirm("현재 학습을 처음부터 다시 시작할까요?")) return;

    closeStudyMenu();

    if (studyMode === "chapter") {
      clearChapterProgress(currentCategory, selectedChapter);
      startChapter(selectedChapter, true);
      return;
    }

    if (studyMode === "random") {
      clearRandomReviewProgress();
      startRandomStudy(50, true);
      return;
    }

    nextRoundItems = [];
    currentIndex = 0;
    roundNumber = 1;
    restoreAnswerVisible = false;
    showCurrentItem();
  });

  document.getElementById("menuWrong")?.addEventListener("click", () => {
    const unique = new Map();

    [...currentItems, ...nextRoundItems].forEach(item => {
      if (getWrongCount(item.id) > 0 && !unique.has(String(item.id))) {
        unique.set(String(item.id), item);
      }
    });

    const wrongItems = [...unique.values()];

    if (wrongItems.length === 0) {
      alert("현재 학습 범위에는 공부하겠음으로 표시한 단어가 없습니다.");
      return;
    }

    closeStudyMenu();
    studyMode = "annoying";
    startStudy(shuffleItems(wrongItems));
  });

  document.getElementById("menuRandom")?.addEventListener("click", () => {
    saveChapterProgress();
    saveRandomReviewProgress();
    closeStudyMenu();
    renderRandomScreen();
    showScreen("random");
  });

  document.getElementById("menuEdit")?.addEventListener("click", () => {
    closeStudyMenu();

    if (editCurrentButton.hidden) {
      alert("직접 추가한 단어만 수정할 수 있습니다.");
      return;
    }

    editCurrentButton.click();
  });

  document.getElementById("menuSettings")?.addEventListener("click", () => {
    closeStudyMenu();
    ttsSettingsButton.click();
  });
});
