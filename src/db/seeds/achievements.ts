import { db } from '@/db';
import { achievements } from '@/db/schema';

async function main() {
    // Delete all existing achievements first
    await db.delete(achievements);

    const sampleAchievements = [
        {
            name: 'First Steps',
            description: 'Welcome to the community!',
            icon: '🎬',
            requirement: '1 review',
            badgeColor: '#4F46E5',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Movie Critic',
            description: "You're getting the hang of it!",
            icon: '✍️',
            requirement: '5 reviews',
            badgeColor: '#8B5CF6',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Film Buff',
            description: 'A true movie enthusiast',
            icon: '🎭',
            requirement: '10 reviews',
            badgeColor: '#7C3AED',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Review Master',
            description: "You've seen it all!",
            icon: '🏆',
            requirement: '25 reviews',
            badgeColor: '#6D28D9',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Legendary Critic',
            description: 'A legend among critics',
            icon: '👑',
            requirement: '50 reviews',
            badgeColor: '#5B21B6',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Favorites Collector',
            description: 'Building your collection',
            icon: '❤️',
            requirement: '10 favorites',
            badgeColor: '#DC2626',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Watchlist Planner',
            description: 'Planning your viewing schedule',
            icon: '📚',
            requirement: '20 watch later',
            badgeColor: '#0891B2',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Early Adopter',
            description: 'You were here from the start!',
            icon: '🌟',
            requirement: 'early_user',
            badgeColor: '#059669',
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(achievements).values(sampleAchievements);
    
    console.log('✅ Achievements seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});