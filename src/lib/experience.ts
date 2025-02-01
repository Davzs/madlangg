import User from '@/models/User';

export const EXPERIENCE_ACTIONS = {
  COMPLETE_LESSON: 50,
  PERFECT_LESSON: 100,
  DAILY_STREAK: 20,
  FIRST_ACHIEVEMENT: 200,
} as const;

export async function awardExperience(userId: string, amount: number) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.experience += amount;

  // Calculate required XP for next level using a curve: level^1.5 * 100
  const requiredXP = Math.pow(user.level, 1.5) * 100;

  // Level up if enough XP
  while (user.experience >= requiredXP) {
    user.experience -= requiredXP;
    user.level += 1;
    
    // Add level-up achievement if it's a milestone level
    if (user.level % 5 === 0) {
      user.achievements.push({
        name: `Level ${user.level} Master`,
        description: `Reached level ${user.level}!`,
        icon: '🏆',
        earnedAt: new Date(),
      });
    }
  }

  await user.save();
  return user;
}

export async function checkAndAwardAchievements(userId: string) {
  const user = await User.findById(userId);
  if (!user) return null;

  // Check for various achievements
  const userProgress = await User.aggregate([
    { $match: { _id: user._id } },
    {
      $lookup: {
        from: 'userprogresses',
        localField: '_id',
        foreignField: 'userId',
        as: 'progress'
      }
    }
  ]);

  if (!userProgress[0]) return user;

  const progress = userProgress[0];
  const achievements = [];

  // First Lesson Achievement
  if (progress.progress.length >= 1 && !hasAchievement(user, 'First Steps')) {
    achievements.push({
      name: 'First Steps',
      description: 'Completed your first lesson',
      icon: '🌱',
    });
  }

  // Vocabulary Master Achievement
  if (progress.progress.length >= 100 && !hasAchievement(user, 'Vocabulary Master')) {
    achievements.push({
      name: 'Vocabulary Master',
      description: 'Learned 100 vocabulary items',
      icon: '📚',
    });
  }

  // Study Streak Achievement
  if (user.stats?.studyStreak >= 7 && !hasAchievement(user, 'Week Warrior')) {
    achievements.push({
      name: 'Week Warrior',
      description: 'Maintained a 7-day study streak',
      icon: '🔥',
    });
  }

  // Add new achievements
  if (achievements.length > 0) {
    user.achievements.push(...achievements.map(achievement => ({
      ...achievement,
      earnedAt: new Date(),
    })));
    await user.save();

    // Award experience for first achievement
    if (!hasAchievement(user, 'First Steps')) {
      await awardExperience(userId, EXPERIENCE_ACTIONS.FIRST_ACHIEVEMENT);
    }
  }

  return user;
}

function hasAchievement(user: any, achievementName: string): boolean {
  return user.achievements.some((a: any) => a.name === achievementName);
}
