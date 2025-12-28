import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsageTracker } from '@/server/usage/tracker';

// Mock dependencies
const mockIncrementUsage = vi.fn();
const mockGetUsageForFeature = vi.fn();

vi.mock('@/server/subscription/service', () => ({
    incrementUsage: (...args: any[]) => mockIncrementUsage(...args),
    getUsageForFeature: (...args: any[]) => mockGetUsageForFeature(...args),
}));

describe('UsageTracker', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('trackUsage', () => {
        it('should call incrementUsage with correct parameters', async () => {
            await UsageTracker.trackUsage('user-1', 'OPENAI_GPT4', 100);

            expect(mockIncrementUsage).toHaveBeenCalledWith('user-1', 'OPENAI_GPT4', 100, undefined);
        });

        it('should handle errors gracefully without throwing', async () => {
            mockIncrementUsage.mockRejectedValue(new Error('DB Error'));

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(UsageTracker.trackUsage('user-1', 'OPENAI_GPT4', 100)).resolves.not.toThrow();

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('getUserUsage', () => {
        it('should aggregate token usage correctly', async () => {
            // Mock usage for different features
            mockGetUsageForFeature.mockImplementation((userId, feature) => {
                const usageMap: Record<string, number> = {
                    'OPENAI_GPT4': 100,
                    'OPENAI_GPT35': 50,
                    'STABILITY_SDXL': 2, // images, maybe treated as tokens based on logic? 
                    // tracker.ts logic: "totalTokens += stats.used". 
                    // It seems it treats all AI features as adding to "totalTokens".
                    'PRESENTATION_GENERATED': 1,
                    'STORAGE_UPLOAD': 500, // MB
                };
                return Promise.resolve({ used: usageMap[feature] || 0 });
            });

            const stats = await UsageTracker.getUserUsage('user-1');

            // 100 + 50 + 2 + 1 = 153 tokens (based on current simple logic in tracker.ts)
            expect(stats.totalTokens).toBe(153);
            expect(stats.totalStorage).toBe(500);
        });
    });
});
