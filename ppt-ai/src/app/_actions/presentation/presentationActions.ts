"use server";

import { type PlateSlide } from "@/components/presentation/utils/parser";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { type InputJsonValue } from "@prisma/client/runtime/library";

import { z } from "zod";

const createPresentationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  theme: z.string().optional().default("default"),
  imageSource: z.string().optional(),
  presentationStyle: z.string().optional(),
  language: z.string().optional(),
  outline: z.array(z.string()).optional(),
  // Content validation is complex, we'll keep it as unknown/any for now but ensure it's an object
  content: z.object({
    slides: z.array(z.any())
  })
});

const updatePresentationSchema = z.object({
  id: z.string(),
  title: z.string().max(200).optional(),
  theme: z.string().optional(),
  prompt: z.string().optional(),
  imageSource: z.string().optional(),
  presentationStyle: z.string().optional(),
  language: z.string().optional(),
  outline: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  content: z.object({
    slides: z.array(z.any()),
    config: z.record(z.unknown()).optional()
  }).optional(),
  searchResults: z.array(z.object({
    query: z.string(),
    results: z.array(z.unknown())
  })).optional()
});

export async function createPresentation(input: {
  content: {
    slides: PlateSlide[];
  };
  title: string;
  theme?: string;
  outline?: string[];
  imageSource?: string;
  presentationStyle?: string;
  language?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  const validatedFields = createPresentationSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid input: " + (validatedFields.error?.issues[0]?.message || "Validation failed"),
    };
  }

  const { title, theme, imageSource, presentationStyle, language, outline, content } = validatedFields.data;

  console.log("[Presentation] Creating presentation", { title, theme, userId });

  try {
    const presentation = await db.baseDocument.create({
      data: {
        type: "PRESENTATION",
        documentType: "presentation",
        title: title,
        userId,
        presentation: {
          create: {
            content: content as unknown as InputJsonValue,
            theme: theme,
            imageSource,
            presentationStyle,
            language,
            outline: outline,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    console.log("[Presentation] Created successfully", { id: presentation.id, userId });

    return {
      success: true,
      message: "Presentation created successfully",
      presentation,
    };
  } catch (error) {
    console.error("[Presentation] Creation failed", { userId, error });
    return {
      success: false,
      message: "Failed to create presentation",
    };
  }
}

export async function createEmptyPresentation(
  title: string,
  theme = "default",
  language = "en-US",
) {
  const emptyContent: { slides: PlateSlide[] } = { slides: [] };

  return createPresentation({
    content: emptyContent,
    title,
    theme,
    language,
  });
}

export async function updatePresentation(input: {
  id: string;
  content?: {
    slides: PlateSlide[];
    config: Record<string, unknown>;
  };
  title?: string;
  theme?: string;
  prompt?: string;
  outline?: string[];
  searchResults?: Array<{ query: string; results: unknown[] }>;
  imageSource?: string;
  presentationStyle?: string;
  language?: string;
  thumbnailUrl?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validatedFields = updatePresentationSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid input: " + (validatedFields.error?.issues[0]?.message || "Validation failed"),
    };
  }

  const {
    id, title, theme, prompt, outline, searchResults,
    imageSource, presentationStyle, language, thumbnailUrl, content
  } = validatedFields.data;

  try {
    // Extract values from content if provided there
    const effectiveTheme = theme;
    const effectiveImageSource = imageSource;
    const effectivePresentationStyle = presentationStyle;
    const effectiveLanguage = language;

    console.log("[Presentation] Updating", { id, userId: session.user.id });

    // Update base document with all presentation data
    const presentation = await db.baseDocument.update({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
      data: {
        title: title,
        thumbnailUrl,
        presentation: {
          update: {
            prompt: prompt,
            content: content as unknown as InputJsonValue,
            theme: effectiveTheme,
            imageSource: effectiveImageSource,
            presentationStyle: effectivePresentationStyle,
            language: effectiveLanguage,
            outline,
            searchResults: searchResults as unknown as InputJsonValue,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    console.log("[Presentation] Updated successfully", { id, userId: session.user.id });

    return {
      success: true,
      message: "Presentation updated successfully",
      presentation,
    };
  } catch (error) {
    console.error("[Presentation] Update failed", { id, userId: session.user.id, error });
    return {
      success: false,
      message: "Failed to update presentation",
    };
  }
}

export async function updatePresentationTitle(id: string, title: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.baseDocument.update({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
      data: { title },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation title updated successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation title",
    };
  }
}

export async function deletePresentation(id: string) {
  return deletePresentations([id]);
}

export async function deletePresentations(ids: string[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    console.log("[Presentation] Deleting presentations", { ids, userId: session.user.id });

    // Delete the base documents using deleteMany (this will cascade delete the presentations)
    const result = await db.baseDocument.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: session.user.id, // Ensure only user's own presentations can be deleted
      },
    });

    const deletedCount = result.count;
    const failedCount = ids.length - deletedCount;

    console.log("[Presentation] Deletion result", { deletedCount, failedCount, userId: session.user.id });

    if (failedCount > 0) {
      return {
        success: deletedCount > 0,
        message:
          deletedCount > 0
            ? `Deleted ${deletedCount} presentations, failed to delete ${failedCount} presentations`
            : "Failed to delete presentations",
        partialSuccess: deletedCount > 0,
      };
    }

    return {
      success: true,
      message:
        ids.length === 1
          ? "Presentation deleted successfully"
          : `${deletedCount} presentations deleted successfully`,
    };
  } catch (error) {
    console.error("[Presentation] Deletion failed", { ids, error });
    return {
      success: false,
      message: "Failed to delete presentations",
    };
  }
}

// Get the presentation with the presentation content
export async function getPresentation(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.baseDocument.findUnique({
      where: { id },
      include: {
        presentation: true,
      },
    });

    if (!presentation) {
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    // Check ownership or public status
    if (presentation.userId !== session.user.id && !presentation.isPublic) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    }

    return {
      success: true,
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function getPresentationContent(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.baseDocument.findUnique({
      where: { id },
      include: {
        presentation: {
          select: {
            id: true,
            content: true,
            theme: true,
            outline: true,
          },
        },
      },
    });

    if (!presentation) {
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    // Check if the user has access to this presentation
    if (presentation.userId !== session.user.id && !presentation.isPublic) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    }

    return {
      success: true,
      presentation: presentation.presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function updatePresentationTheme(id: string, theme: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.baseDocument.update({
      where: {
        id,
        userId: session.user.id // Ensure ownership
      },
      data: {
        presentation: {
          update: {
            theme
          }
        }
      },
      include: {
        presentation: true
      }
    });

    return {
      success: true,
      message: "Presentation theme updated successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation theme",
    };
  }
}

export async function duplicatePresentation(id: string, newTitle?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the original presentation
    const original = await db.baseDocument.findUnique({
      where: { id },
      include: {
        presentation: true,
      },
    });

    if (!original?.presentation) {
      return {
        success: false,
        message: "Original presentation not found",
      };
    }

    // Check access
    if (original.userId !== session.user.id && !original.isPublic) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    }

    // Create a new presentation with the same content
    const duplicated = await db.baseDocument.create({
      data: {
        type: "PRESENTATION",
        documentType: "presentation",
        title: newTitle ?? `${original.title} (Copy)`,
        userId: session.user.id,
        isPublic: false,
        presentation: {
          create: {
            content: original.presentation.content as unknown as InputJsonValue,
            theme: original.presentation.theme,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation duplicated successfully",
      presentation: duplicated,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to duplicate presentation",
    };
  }
}
