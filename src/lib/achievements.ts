// Achievement checking and awarding logic
interface AchievementCheck {
  name: string;
  checkCondition: (stats: UserStats) => boolean;
}

interface UserStats {
  reviewCount: number;
  favoritesCount: number;
  watchLaterCount: number;
  isEarlyUser?: boolean;
}

const ACHIEVEMENT_THRESHOLDS: AchievementCheck[] = [
  { name: 'First Steps', checkCondition: (stats) => stats.reviewCount >= 1 },
  { name: 'Movie Critic', checkCondition: (stats) => stats.reviewCount >= 5 },
  { name: 'Film Buff', checkCondition: (stats) => stats.reviewCount >= 10 },
  { name: 'Review Master', checkCondition: (stats) => stats.reviewCount >= 25 },
  { name: 'Legendary Critic', checkCondition: (stats) => stats.reviewCount >= 50 },
  { name: 'Favorites Collector', checkCondition: (stats) => stats.favoritesCount >= 10 },
  { name: 'Watchlist Planner', checkCondition: (stats) => stats.watchLaterCount >= 20 },
  { name: 'Early Adopter', checkCondition: (stats) => stats.isEarlyUser === true },
];

export async function checkAndAwardAchievements(userId: string, token: string): Promise<void> {
  try {
    // Fetch user stats
    const [reviewsRes, favoritesRes, watchLaterRes, userAchievementsRes, achievementsRes] = await Promise.all([
      fetch('/api/reviews'),
      fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/watch-later', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/user-achievements', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/achievements', { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (!reviewsRes.ok || !favoritesRes.ok || !watchLaterRes.ok || !userAchievementsRes.ok || !achievementsRes.ok) {
      console.error('Failed to fetch user stats for achievements');
      return;
    }

    const allReviews = await reviewsRes.json();
    const userReviews = allReviews.filter((r: any) => r.userId === userId);
    const favorites = await favoritesRes.json();
    const watchLater = await watchLaterRes.json();
    const userAchievements = await userAchievementsRes.json();
    const allAchievements = await achievementsRes.json();

    const stats: UserStats = {
      reviewCount: userReviews.length,
      favoritesCount: favorites.length,
      watchLaterCount: watchLater.length,
      isEarlyUser: false, // Can be determined by user creation date
    };

    // Check which achievements should be earned
    const earnedAchievementNames = new Set(
      userAchievements.map((ua: any) => ua.achievement.name)
    );

    for (const check of ACHIEVEMENT_THRESHOLDS) {
      if (check.checkCondition(stats) && !earnedAchievementNames.has(check.name)) {
        // Award the achievement
        const achievement = allAchievements.find((a: any) => a.name === check.name);
        if (achievement) {
          await fetch('/api/user-achievements', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ achievement_id: achievement.id }),
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}