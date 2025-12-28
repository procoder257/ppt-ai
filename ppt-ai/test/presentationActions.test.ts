import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPresentation, updatePresentation, deletePresentation } from '@/app/_actions/presentation/presentationActions';
import { db } from '@/server/db';
import { auth } from '@/server/auth';

// Mock dependencies
vi.mock('@/server/db', () => ({
    db: {
        baseDocument: {
            create: vi.fn(),
            update: vi.fn(),
            deleteMany: vi.fn(),
        },
    },
}));

vi.mock('@/server/auth', () => ({
    auth: vi.fn(),
}));

describe('Presentation Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createPresentation', () => {
        it('should create a presentation when authenticated and input is valid', async () => {
            // Mock auth success
            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

            // Mock db success
            const mockPresentation = { id: 'pres-1', title: 'Test', userId: 'user-1' };
            (db.baseDocument.create as any).mockResolvedValue(mockPresentation);

            const result = await createPresentation({
                title: 'Test Presentation',
                content: { slides: [] },
            });

            expect(auth).toHaveBeenCalled();
            expect(db.baseDocument.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userId: 'user-1',
                    title: 'Test Presentation',
                }),
            }));
            expect(result.success).toBe(true);
        });

        it('should fail when input is invalid (empty title)', async () => {
            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

            const result = await createPresentation({
                title: '', // Invalid
                content: { slides: [] },
            });

            expect(db.baseDocument.create).not.toHaveBeenCalled();
            expect(result.success).toBe(false);
            expect(result.message).toContain('Invalid input');
        });

        it('should throw error when unauthorized', async () => {
            (auth as any).mockResolvedValue(null);

            await expect(createPresentation({
                title: 'Test',
                content: { slides: [] },
            })).rejects.toThrow('Unauthorized');
        });
    });

    describe('updatePresentation', () => {
        it('should update presentation when user owns it', async () => {
            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
            (db.baseDocument.update as any).mockResolvedValue({ id: 'pres-1' });

            const result = await updatePresentation({
                id: 'pres-1',
                title: 'Updated Title',
            });

            expect(db.baseDocument.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'pres-1', userId: 'user-1' }, // IDOR CHECK
                data: expect.objectContaining({ title: 'Updated Title' }),
            }));
            expect(result.success).toBe(true);
        });

        it('should fail update when ownership check fails (db throws or returns null)', async () => {
            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
            // Simulate DB fail due to where clause mismatch (user doesn't own doc)
            (db.baseDocument.update as any).mockRejectedValue(new Error('Record to update not found'));

            const result = await updatePresentation({
                id: 'other-user-pres',
                title: 'Hacked',
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Failed to update presentation');
        });
    });

    describe('deletePresentation', () => {
        it('should delete presentation when user owns it', async () => {
            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
            (db.baseDocument.deleteMany as any).mockResolvedValue({ count: 1 });

            const result = await deletePresentation('pres-1');

            expect(db.baseDocument.deleteMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    id: { in: ['pres-1'] },
                    userId: 'user-1', // IDOR CHECK
                },
            }));
            expect(result.success).toBe(true);
        });
    });
});
