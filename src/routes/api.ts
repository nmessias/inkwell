/**
 * API routes (JSON responses)
 */
import { json, matchPath, URL_PATTERNS } from "../server";
import { getChapter, getFiction } from "../services/scraper";
import { getImageCache, setImageCache } from "../services/cache";
import { CACHE_TTL } from "../config";

/**
 * Handle API routes
 * Returns Response if matched, null otherwise
 */
export async function handleApiRoute(
  req: Request,
  path: string
): Promise<Response | null> {
  const method = req.method;

  // Chapter API (JSON) for SPA navigation - GET
  const chapterApiMatch = matchPath(path, URL_PATTERNS.chapterApi);
  if (chapterApiMatch && method === "GET") {
    const id = parseInt(chapterApiMatch[0], 10);

    try {
      // Use TTL to indicate this is for pre-caching (uses anonymous context)
      const chapter = await getChapter(id, CACHE_TTL.CHAPTER);
      if (!chapter) {
        return json({ error: "Chapter not found" }, 404);
      }

      // Extract chapter IDs from URLs
      const prevChapterId = chapter.prevChapterUrl
        ? parseInt(chapter.prevChapterUrl.replace("/chapter/", ""), 10)
        : null;
      const nextChapterId = chapter.nextChapterUrl
        ? parseInt(chapter.nextChapterUrl.replace("/chapter/", ""), 10)
        : null;

      return json({
        id: chapter.id,
        title: chapter.title,
        content: chapter.content,
        fictionId: chapter.fictionId,
        fictionTitle: chapter.fictionTitle,
        prevChapterId,
        nextChapterId,
      });
    } catch (error: any) {
      console.error(`Error fetching chapter API ${id}:`, error);
      return json({ error: error.message || "Failed to load chapter" }, 500);
    }
  }

  // Mark chapter as read - POST
  // This triggers authenticated request to Royal Road for reading progress
  if (chapterApiMatch && method === "POST") {
    const id = parseInt(chapterApiMatch[0], 10);

    try {
      // Call getChapter WITHOUT TTL = uses authenticated context = triggers "mark as read"
      await getChapter(id);
      return json({ success: true, chapterId: id });
    } catch (error: any) {
      console.error(`Error marking chapter ${id} as read:`, error);
      return json({ error: error.message || "Failed to mark as read" }, 500);
    }
  }

  // Cover image proxy
  const coverMatch = matchPath(path, URL_PATTERNS.coverImage);
  if (coverMatch && method === "GET") {
    const fictionId = parseInt(coverMatch[0], 10);
    const cacheKey = `cover:${fictionId}`;

    // Check cache
    const cached = getImageCache(cacheKey);
    if (cached) {
      return new Response(new Uint8Array(cached.data), {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Fetch from Royal Road
    try {
      const fiction = await getFiction(fictionId);
      if (!fiction?.coverUrl) {
        return new Response("Cover not found", { status: 404 });
      }

      const imageResponse = await fetch(fiction.coverUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!imageResponse.ok) {
        return new Response("Failed to fetch cover", { status: 502 });
      }

      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      const imageData = Buffer.from(await imageResponse.arrayBuffer());

      // Cache for 30 days
      setImageCache(cacheKey, imageData, contentType);

      return new Response(new Uint8Array(imageData), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (error: any) {
      console.error(`Error fetching cover for fiction ${fictionId}:`, error);
      return new Response("Error fetching cover", { status: 500 });
    }
  }

  return null;
}
