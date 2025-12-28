/**
 * Page routes (HTML responses)
 */
import { html, parseFormData, matchPath, URL_PATTERNS } from "../server";
import {
  HomePage,
  SetupPage,
  FollowsPage,
  HistoryPage,
  ToplistsPage,
  ToplistPage,
  FictionPage,
  SearchPage,
  CachePage,
  ErrorPage,
} from "../templates";
import { ReaderPage } from "../templates/pages/reader";
import {
  setCookie,
  clearCookies,
  clearCache,
  clearCacheByType,
  clearImageCache,
  clearExpiredCache,
  hasSessionCookies,
  getCacheStats,
} from "../services/cache";
import {
  getFollows,
  getHistory,
  getToplist,
  getFiction,
  getChapter,
  validateCookies,
  createContext,
  searchFictions,
} from "../services/scraper";
import { triggerCacheWarm } from "../services/jobs";
import { TOPLISTS } from "../config";
import type { ReaderSettings } from "../config";

/**
 * Handle page routes
 * Returns Response if matched, null otherwise
 */
export async function handlePageRoute(
  req: Request,
  path: string,
  url: URL,
  settings: ReaderSettings
): Promise<Response | null> {
  const method = req.method;

  // Home
  if (path === "/" && method === "GET") {
    return html(HomePage({ settings }));
  }

  // Setup - GET
  if (path === "/setup" && method === "GET") {
    return html(SetupPage({ settings }));
  }

  // Setup - POST
  if (path === "/setup" && method === "POST") {
    const form = await parseFormData(req);
    const identity = form.identity?.trim();
    const cfclearance = form.cfclearance?.trim();

    if (!identity) {
      return html(
        SetupPage({ message: "The .AspNetCore.Identity.Application cookie is required.", isError: true, settings })
      );
    }

    setCookie(".AspNetCore.Identity.Application", identity);
    if (cfclearance) {
      setCookie("cf_clearance", cfclearance);
    }

    const valid = await validateCookies();

    if (valid) {
      triggerCacheWarm().catch(console.error);
      return html(
        SetupPage({
          message: "Cookies saved and validated successfully! Cache warming started. You can now access your follows.",
          isError: false,
          settings,
        })
      );
    } else {
      return html(
        SetupPage({ message: "Cookies saved but validation failed. Please check your cookie values.", isError: true, settings })
      );
    }
  }

  // Setup - Clear
  if (path === "/setup/clear" && method === "GET") {
    clearCookies();
    clearCache();
    await createContext();
    return html(SetupPage({ message: "Cookies and cache cleared.", isError: false, settings }));
  }

  // Cache management
  if (path === "/cache" && method === "GET") {
    const stats = getCacheStats();
    return html(CachePage({ stats, settings }));
  }

  // Clear cache routes
  const cacheTypeMatch = matchPath(path, URL_PATTERNS.cacheType);
  if (cacheTypeMatch && method === "GET") {
    const type = cacheTypeMatch[0];
    let message: string;

    if (type === "images") {
      const deleted = clearImageCache();
      message = `Cleared ${deleted} cached images.`;
    } else if (type === "expired") {
      clearExpiredCache();
      message = "Cleared expired cache entries.";
    } else if (type === "all") {
      clearCache();
      clearImageCache();
      message = "Cleared all cache.";
    } else {
      const deleted = clearCacheByType(type);
      message = `Cleared ${deleted} ${type} cache entries.`;
    }

    return html(CachePage({ stats: getCacheStats(), message, settings }));
  }

  // Follows
  if (path === "/follows" && method === "GET") {
    if (!hasSessionCookies()) {
      return html(
        ErrorPage({ title: "Not Configured", message: "Please configure your session cookies first.", retryUrl: "/setup", settings })
      );
    }

    try {
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const fictions = await getFollows();
      return html(FollowsPage({ fictions, page, settings }));
    } catch (error: any) {
      console.error("Error fetching follows:", error);
      return html(
        ErrorPage({
          title: "Error Loading Follows",
          message: error.message || "Failed to load follows. Try again.",
          retryUrl: "/follows",
          settings,
        })
      );
    }
  }

  // History
  if (path === "/history" && method === "GET") {
    if (!hasSessionCookies()) {
      return html(
        ErrorPage({ title: "Not Configured", message: "Please configure your session cookies first.", retryUrl: "/setup", settings })
      );
    }

    try {
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const history = await getHistory();
      return html(HistoryPage({ history, page, settings }));
    } catch (error: any) {
      console.error("Error fetching history:", error);
      return html(
        ErrorPage({
          title: "Error Loading History",
          message: error.message || "Failed to load history. Try again.",
          retryUrl: "/history",
          settings,
        })
      );
    }
  }

  // Toplists index
  if (path === "/toplists" && method === "GET") {
    return html(ToplistsPage({ settings }));
  }

  // Search
  if (path === "/search" && method === "GET") {
    const query = url.searchParams.get("q")?.trim() || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);

    if (!query) {
      return html(SearchPage({ settings }));
    }

    try {
      const results = await searchFictions(query);
      return html(SearchPage({ query, results, page, settings }));
    } catch (error: any) {
      console.error(`Error searching for "${query}":`, error);
      return html(
        ErrorPage({ title: "Search Error", message: error.message || "Failed to search. Try again.", retryUrl: "/search", settings })
      );
    }
  }

  // Toplist detail
  const toplistMatch = matchPath(path, URL_PATTERNS.toplist);
  if (toplistMatch && method === "GET") {
    const slug = toplistMatch[0];
    const toplist = TOPLISTS.find(t => t.slug === slug);

    if (!toplist) {
      return html(ErrorPage({ title: "Not Found", message: `Toplist "${slug}" not found.`, settings }), 404);
    }

    try {
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const fictions = await getToplist(toplist);
      return html(ToplistPage({ toplist, fictions, page, settings }));
    } catch (error: any) {
      console.error(`Error fetching toplist ${slug}:`, error);
      return html(
        ErrorPage({
          title: "Error Loading Toplist",
          message: error.message || "Failed to load toplist. Try again.",
          retryUrl: `/toplist/${slug}`,
          settings,
        })
      );
    }
  }

  // Fiction detail
  const fictionMatch = matchPath(path, URL_PATTERNS.fiction);
  if (fictionMatch && method === "GET") {
    const id = parseInt(fictionMatch[0], 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);

    try {
      const fiction = await getFiction(id);
      if (!fiction) {
        return html(ErrorPage({ title: "Not Found", message: `Fiction ${id} not found.`, settings }), 404);
      }
      return html(FictionPage({ fiction, chapterPage: page, settings }));
    } catch (error: any) {
      console.error(`Error fetching fiction ${id}:`, error);
      return html(
        ErrorPage({
          title: "Error Loading Fiction",
          message: error.message || "Failed to load fiction. Try again.",
          retryUrl: `/fiction/${id}`,
          settings,
        })
      );
    }
  }

  // Chapter reader
  const chapterMatch = matchPath(path, URL_PATTERNS.chapter);
  if (chapterMatch && method === "GET") {
    const id = parseInt(chapterMatch[0], 10);

    try {
      const chapter = await getChapter(id);
      if (!chapter) {
        return html(ErrorPage({ title: "Not Found", message: `Chapter ${id} not found.`, settings }), 404);
      }
      return html(ReaderPage({ chapter, settings }));
    } catch (error: any) {
      console.error(`Error fetching chapter ${id}:`, error);
      return html(
        ErrorPage({
          title: "Error Loading Chapter",
          message: error.message || "Failed to load chapter. Try again.",
          retryUrl: `/chapter/${id}`,
          settings,
        })
      );
    }
  }

  return null;
}
