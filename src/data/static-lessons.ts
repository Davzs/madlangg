export interface ILesson {
  _id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  xpReward: number;
  content: {
    introduction: string;
    objectives: string[];
    exercises: {
      type: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }[];
    culturalNotes: string;
  };
  estimatedTime: number;
  order: number;
}

export const STATIC_LESSONS: ILesson[] = [
  {
    _id: "lesson-1",
    title: "Basic Greetings in Chinese",
    description: "Learn essential Chinese greetings and how to introduce yourself. Perfect for beginners!",
    type: "vocabulary",
    difficulty: "beginner",
    xpReward: 20,
    content: {
      introduction: "Welcome to your first Chinese lesson! Today, we'll learn the most common greetings in Chinese. These phrases will help you start conversations and make a great first impression.",
      objectives: [
        "Learn to say 'hello' and 'goodbye' in Chinese",
        "Understand basic greeting etiquette",
        "Practice self-introduction phrases",
        "Master the correct pronunciation of basic greetings"
      ],
      exercises: [
        {
          type: "multiple-choice",
          question: "How do you say 'hello' in Chinese?",
          options: ["你好 (nǐ hǎo)", "再见 (zài jiàn)", "谢谢 (xiè xie)", "对不起 (duì bù qǐ)"],
          correctAnswer: "你好 (nǐ hǎo)",
          explanation: "你好 (nǐ hǎo) is the standard way to say 'hello' in Chinese."
        },
        {
          type: "multiple-choice",
          question: "Which phrase means 'goodbye' in Chinese?",
          options: ["你好 (nǐ hǎo)", "再见 (zài jiàn)", "早上好 (zǎo shang hǎo)", "晚安 (wǎn ān)"],
          correctAnswer: "再见 (zài jiàn)",
          explanation: "再见 (zài jiàn) literally means 'see you again' and is used to say 'goodbye'."
        },
        {
          type: "multiple-choice",
          question: "What's the correct greeting for 'good morning'?",
          options: ["晚上好 (wǎn shang hǎo)", "再见 (zài jiàn)", "早上好 (zǎo shang hǎo)", "你好 (nǐ hǎo)"],
          correctAnswer: "早上好 (zǎo shang hǎo)",
          explanation: "早上好 (zǎo shang hǎo) is used in the morning and means 'good morning'."
        }
      ],
      culturalNotes: "In Chinese culture, greetings often include asking about whether someone has eaten or where they're going. These questions are considered polite conversation starters rather than actual inquiries."
    },
    estimatedTime: 15,
    order: 1,
  },
  {
    _id: "lesson-2",
    title: "Numbers 1-10 in Chinese",
    description: "Master the basic numbers in Chinese. Essential for shopping, phone numbers, and daily life!",
    type: "vocabulary",
    difficulty: "beginner",
    xpReward: 20,
    content: {
      introduction: "Numbers are fundamental in any language. In this lesson, you'll learn to count from 1 to 10 in Chinese. These numbers are used frequently in daily life and form the basis for larger numbers.",
      objectives: [
        "Learn to count from 1 to 10 in Chinese",
        "Understand the pronunciation rules for numbers",
        "Practice using numbers in simple phrases",
        "Learn number-related vocabulary"
      ],
      exercises: [
        {
          type: "multiple-choice",
          question: "What is the number '5' in Chinese?",
          options: ["三 (sān)", "五 (wǔ)", "七 (qī)", "九 (jiǔ)"],
          correctAnswer: "五 (wǔ)",
          explanation: "五 (wǔ) is the Chinese number for 5."
        },
        {
          type: "multiple-choice",
          question: "Which number is 八 (bā)?",
          options: ["6", "7", "8", "9"],
          correctAnswer: "8",
          explanation: "八 (bā) is the Chinese number for 8. It's considered a lucky number in Chinese culture."
        },
        {
          type: "multiple-choice",
          question: "What comes after 六 (liù)?",
          options: ["五 (wǔ)", "七 (qī)", "八 (bā)", "九 (jiǔ)"],
          correctAnswer: "七 (qī)",
          explanation: "七 (qī) means 7 and comes after 六 (liù) which means 6."
        }
      ],
      culturalNotes: "Numbers play a significant role in Chinese culture. Some numbers are considered lucky (like 8) because their pronunciation sounds similar to positive words, while others (like 4) are considered unlucky."
    },
    estimatedTime: 20,
    order: 2,
  },
  {
    _id: "lesson-3",
    title: "Basic Chinese Phrases for Dining",
    description: "Learn essential phrases for ordering food and dining out in Chinese restaurants.",
    type: "conversation",
    difficulty: "beginner",
    xpReward: 20,
    content: {
      introduction: "Food is an essential part of Chinese culture. In this lesson, you'll learn key phrases for ordering food and expressing your preferences. These phrases will help you navigate Chinese restaurants and enjoy authentic cuisine.",
      objectives: [
        "Learn basic food-related vocabulary",
        "Master phrases for ordering in restaurants",
        "Understand how to express likes and dislikes",
        "Practice common dining expressions"
      ],
      exercises: [
        {
          type: "multiple-choice",
          question: "How do you say 'I want' in Chinese?",
          options: ["你好 (nǐ hǎo)", "谢谢 (xiè xie)", "我要 (wǒ yào)", "再见 (zài jiàn)"],
          correctAnswer: "我要 (wǒ yào)",
          explanation: "我要 (wǒ yào) means 'I want' and is commonly used when ordering food."
        },
        {
          type: "multiple-choice",
          question: "Which phrase means 'Thank you' in Chinese?",
          options: ["不客气 (bù kè qì)", "谢谢 (xiè xie)", "请问 (qǐng wèn)", "对不起 (duì bù qǐ)"],
          correctAnswer: "谢谢 (xiè xie)",
          explanation: "谢谢 (xiè xie) is the standard way to say 'thank you' in Chinese."
        },
        {
          type: "multiple-choice",
          question: "How do you ask 'How much?' in Chinese?",
          options: ["多少钱 (duō shao qián)", "你好 (nǐ hǎo)", "再见 (zài jiàn)", "谢谢 (xiè xie)"],
          correctAnswer: "多少钱 (duō shao qián)",
          explanation: "多少钱 (duō shao qián) literally means 'how much money' and is used to ask about prices."
        }
      ],
      culturalNotes: "In Chinese dining culture, it's common to share dishes family-style. When dining with others, it's polite to let elders or guests start eating first. Leaving a bit of food on your plate is considered polite, as finishing everything might suggest you weren't given enough food."
    },
    estimatedTime: 25,
    order: 3,
  }
];
