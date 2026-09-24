import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCustomThemeById } from "@/app/_actions/presentation/theme-actions";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

vi.mock("@/app/api/uploadthing/core", () => ({ utapi: {} }));
vi.mock("@/server/auth", () => ({ auth: vi.fn() }));
vi.mock("@/server/db", () => ({
  db: {
    customTheme: { findUnique: vi.fn() },
    presentation: { findFirst: vi.fn() },
  },
}));

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
const findTheme = db.customTheme.findUnique as unknown as ReturnType<typeof vi.fn>;
const findPresentation = db.presentation.findFirst as unknown as ReturnType<typeof vi.fn>;

const privateTheme = { id: "t1", userId: "owner", isPublic: false, name: "Mine" };

describe("getCustomThemeById access control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findPresentation.mockResolvedValue(null);
  });

  it("returns public themes to anyone", async () => {
    findTheme.mockResolvedValue({ ...privateTheme, isPublic: true });
    mockAuth.mockResolvedValue(null);
    expect((await getCustomThemeById("t1")).success).toBe(true);
  });

  it("returns a private theme to its owner", async () => {
    findTheme.mockResolvedValue(privateTheme);
    mockAuth.mockResolvedValue({ user: { id: "owner" } });
    expect((await getCustomThemeById("t1")).success).toBe(true);
  });

  it("hides a private theme from other users", async () => {
    findTheme.mockResolvedValue(privateTheme);
    mockAuth.mockResolvedValue({ user: { id: "someone-else" } });
    const result = await getCustomThemeById("t1");
    expect(result.success).toBe(false);
    expect(result).not.toHaveProperty("theme");
  });

  it("allows a private theme used by a presentation the viewer can see", async () => {
    findTheme.mockResolvedValue(privateTheme);
    mockAuth.mockResolvedValue(null);
    findPresentation.mockResolvedValue({ id: "p1" });
    expect((await getCustomThemeById("t1")).success).toBe(true);
    expect(findPresentation).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customThemeId: "t1", base: { OR: [{ isPublic: true }] } },
      }),
    );
  });

  it("returns the same message for missing and private themes", async () => {
    mockAuth.mockResolvedValue(null);
    findTheme.mockResolvedValue(null);
    const missing = await getCustomThemeById("nope");
    findTheme.mockResolvedValue(privateTheme);
    const hidden = await getCustomThemeById("t1");
    expect(hidden).toEqual(missing);
  });
});
