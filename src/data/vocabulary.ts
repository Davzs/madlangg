import { VocabularyList, VocabularyWord } from "@/types/vocabulary";

export const sampleVocabularyWords: VocabularyWord[] = [
  {
    id: "1",
    chinese: "你好",
    pinyin: "nǐ hǎo",
    english: "hello",
    category: "greetings",
    level: "beginner",
    examples: [
      {
        chinese: "你好吗？",
        pinyin: "nǐ hǎo ma?",
        english: "How are you?"
      }
    ],
    components: [
      { character: "你", meaning: "you" },
      { character: "好", meaning: "good" }
    ],
    userProgress: {
      timesReviewed: 5,
      lastReviewed: new Date("2024-01-20"),
      proficiency: 85,
      needsReview: false
    }
  },
  {
    id: "2",
    chinese: "再见",
    pinyin: "zài jiàn",
    english: "goodbye",
    category: "greetings",
    level: "beginner",
    examples: [
      {
        chinese: "明天见！",
        pinyin: "míng tiān jiàn!",
        english: "See you tomorrow!"
      }
    ],
    components: [
      { character: "再", meaning: "again" },
      { character: "见", meaning: "to see" }
    ],
    userProgress: {
      timesReviewed: 3,
      lastReviewed: new Date("2024-01-19"),
      proficiency: 70,
      needsReview: true
    }
  },
  {
    id: "3",
    chinese: "谢谢",
    pinyin: "xiè xiè",
    english: "thank you",
    category: "greetings",
    level: "beginner",
    examples: [
      {
        chinese: "非常谢谢！",
        pinyin: "fēi cháng xiè xiè!",
        english: "Thank you very much!"
      }
    ],
    components: [
      { character: "谢", meaning: "thank" }
    ],
    userProgress: {
      timesReviewed: 4,
      lastReviewed: new Date("2024-01-21"),
      proficiency: 90,
      needsReview: false
    }
  },
  {
    id: "4",
    chinese: "吃",
    pinyin: "chī",
    english: "to eat",
    category: "verbs",
    level: "beginner",
    examples: [
      {
        chinese: "我要吃饭。",
        pinyin: "wǒ yào chī fàn.",
        english: "I want to eat."
      }
    ],
    components: [
      { character: "吃", meaning: "eat" }
    ],
    userProgress: {
      timesReviewed: 2,
      lastReviewed: new Date("2024-01-18"),
      proficiency: 60,
      needsReview: true
    }
  },
  {
    id: "5",
    chinese: "学习",
    pinyin: "xué xí",
    english: "to study",
    category: "verbs",
    level: "beginner",
    examples: [
      {
        chinese: "我在学习中文。",
        pinyin: "wǒ zài xué xí zhōng wén.",
        english: "I am studying Chinese."
      }
    ],
    components: [
      { character: "学", meaning: "learn" },
      { character: "习", meaning: "practice" }
    ],
    userProgress: {
      timesReviewed: 6,
      lastReviewed: new Date("2024-01-22"),
      proficiency: 75,
      needsReview: false
    }
  },
  {
    id: "6",
    chinese: "朋友",
    pinyin: "péng yǒu",
    english: "friend",
    category: "nouns",
    level: "beginner",
    examples: [
      {
        chinese: "他是我的好朋友。",
        pinyin: "tā shì wǒ de hǎo péng yǒu.",
        english: "He is my good friend."
      }
    ],
    components: [
      { character: "朋", meaning: "friend" },
      { character: "友", meaning: "companion" }
    ],
    userProgress: {
      timesReviewed: 4,
      lastReviewed: new Date("2024-01-20"),
      proficiency: 80,
      needsReview: false
    }
  },
  {
    id: "7",
    chinese: "漂亮",
    pinyin: "piào liang",
    english: "beautiful",
    category: "adjectives",
    level: "beginner",
    examples: [
      {
        chinese: "这朵花很漂亮。",
        pinyin: "zhè duǒ huā hěn piào liang.",
        english: "This flower is beautiful."
      }
    ],
    components: [
      { character: "漂", meaning: "float" },
      { character: "亮", meaning: "bright" }
    ],
    userProgress: {
      timesReviewed: 3,
      lastReviewed: new Date("2024-01-19"),
      proficiency: 65,
      needsReview: true
    }
  },
  {
    id: "8",
    chinese: "电脑",
    pinyin: "diàn nǎo",
    english: "computer",
    category: "nouns",
    level: "beginner",
    examples: [
      {
        chinese: "我的电脑是新的。",
        pinyin: "wǒ de diàn nǎo shì xīn de.",
        english: "My computer is new."
      }
    ],
    components: [
      { character: "电", meaning: "electricity" },
      { character: "脑", meaning: "brain" }
    ],
    userProgress: {
      timesReviewed: 5,
      lastReviewed: new Date("2024-01-21"),
      proficiency: 85,
      needsReview: false
    }
  }
];

export const vocabularyLists: VocabularyList[] = [
  {
    id: "basic-greetings",
    name: "Basic Greetings",
    description: "Essential greetings and basic conversational phrases",
    category: "greetings",
    level: "beginner",
    words: sampleVocabularyWords.filter(w => w.category === "greetings"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "common-verbs",
    name: "Common Verbs",
    description: "Essential verbs for daily conversation",
    category: "verbs",
    level: "beginner",
    words: sampleVocabularyWords.filter(w => w.category === "verbs"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "basic-nouns",
    name: "Basic Nouns",
    description: "Common nouns used in everyday situations",
    category: "nouns",
    level: "beginner",
    words: sampleVocabularyWords.filter(w => w.category === "nouns"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "common-adjectives",
    name: "Common Adjectives",
    description: "Basic adjectives for describing things and people",
    category: "adjectives",
    level: "beginner",
    words: sampleVocabularyWords.filter(w => w.category === "adjectives"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-20")
  }
];
