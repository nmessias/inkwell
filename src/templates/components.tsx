/**
 * Reusable UI components using JSX
 */
import { NAV_LINKS, ITEMS_PER_PAGE } from "../config";
import type { Fiction, FollowedFiction } from "../types";

/**
 * Navigation bar component
 */
export function Nav({ currentPath = "" }: { currentPath?: string }): JSX.Element {
  return (
    <nav class="nav">
      {NAV_LINKS.map((l) => (
        <a
          href={l.href}
          class={`btn ${currentPath === l.href ? "" : "btn-outline"}`}
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}

/**
 * Pagination controls
 */
export function Pagination({
  currentPage,
  totalItems,
  basePath,
  itemsPerPage = ITEMS_PER_PAGE,
}: {
  currentPage: number;
  totalItems: number;
  basePath: string;
  itemsPerPage?: number;
}): JSX.Element {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return <></>;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const separator = basePath.includes("?") ? "&" : "?";

  return (
    <div class="pagination">
      {prevPage ? (
        <a href={`${basePath}${separator}page=${prevPage}`} class="btn btn-outline">
          ← Prev
        </a>
      ) : (
        <span class="btn btn-outline" style="opacity: 0.3;">
          ← Prev
        </span>
      )}
      <span class="page-info">
        {currentPage} / {totalPages}
      </span>
      {nextPage ? (
        <a href={`${basePath}${separator}page=${nextPage}`} class="btn btn-outline">
          Next →
        </a>
      ) : (
        <span class="btn btn-outline" style="opacity: 0.3;">
          Next →
        </span>
      )}
    </div>
  );
}

/**
 * Get paginated slice of items
 */
export function paginate<T>(items: T[], page: number, itemsPerPage: number = ITEMS_PER_PAGE): T[] {
  const start = (page - 1) * itemsPerPage;
  return items.slice(start, start + itemsPerPage);
}

/**
 * Alert/message box
 */
export function Alert({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}): JSX.Element {
  return (
    <div class={isError ? "error" : "success"} safe>
      {message}
    </div>
  );
}

/**
 * Cover image with fallback
 */
export function CoverImage({
  url,
  alt = "",
  size = "medium",
}: {
  url?: string;
  alt?: string;
  size?: "small" | "medium" | "large";
}): JSX.Element {
  const sizes = {
    small: { width: 50, height: 70 },
    medium: { width: 100, height: 140 },
    large: { width: 150, height: 200 },
  };
  const { width, height } = sizes[size];

  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        style={`width: ${width}px; object-fit: cover; border: 1px solid #000; flex-shrink: 0;`}
      />
    );
  }
  return (
    <div
      style={`width: ${width}px; height: ${height}px; background: #f0f0f0; border: 1px solid #000; flex-shrink: 0;`}
    ></div>
  );
}

/**
 * Fiction card props
 */
export interface FictionCardProps {
  fiction: Fiction | FollowedFiction;
  rank?: number;
  showContinue?: boolean;
  showDescription?: boolean;
  showUnread?: boolean;
  showLatestChapter?: boolean;
  showLastRead?: boolean;
}

/**
 * Fiction card for lists (follows, toplists, search results)
 */
export function FictionCard({
  fiction,
  rank,
  showContinue = false,
  showDescription = false,
  showUnread = false,
  showLatestChapter = false,
  showLastRead = false,
}: FictionCardProps): JSX.Element {
  const f = fiction as FollowedFiction;

  // Build title prefix and unread indicator
  const titlePrefix = rank !== undefined ? `${rank}. ` : "";
  const rating = fiction.stats?.rating ? ` • ${fiction.stats.rating.toFixed(1)}★` : "";

  return (
    <li class="fiction-item" style="display: flex; gap: 12px; align-items: flex-start;">
      <CoverImage url={fiction.coverUrl} alt={fiction.title} />
      <div class="fiction-info" style="flex: 1; min-width: 0;">
        <div class="fiction-title">
          {titlePrefix}
          <a href={`/fiction/${fiction.id}`} safe>
            {fiction.title}
          </a>
          {showUnread && f.hasUnread && <strong> [NEW]</strong>}
          {showDescription && fiction.description && (
            <button class="desc-toggle" data-target={`desc-${fiction.id}`}>
              Info
            </button>
          )}
        </div>
        <div class="fiction-meta">
          by <span safe>{fiction.author || "Unknown"}</span>
          {rating}
        </div>

        {showLatestChapter && f.latestChapter && (
          <div class="fiction-meta">
            Latest:{" "}
            {f.latestChapterId ? (
              <a href={`/chapter/${f.latestChapterId}`} safe>
                {f.latestChapter}
              </a>
            ) : (
              <span safe>{f.latestChapter}</span>
            )}
          </div>
        )}

        {showLastRead && f.lastRead && (
          <div class="fiction-meta">
            Last read:{" "}
            {f.lastReadChapterId ? (
              <a href={`/chapter/${f.lastReadChapterId}`} safe>
                {f.lastRead}
              </a>
            ) : (
              <span safe>{f.lastRead}</span>
            )}
          </div>
        )}

        {showContinue && (
          <>
            {f.nextChapterId ? (
              <a
                href={`/chapter/${f.nextChapterId}`}
                class="btn"
                style="padding: 6px 12px; font-size: 14px; margin-top: 8px; display: inline-block;"
              >
                Continue →
              </a>
            ) : f.lastReadChapterId ? (
              <a
                href={`/fiction/${fiction.id}`}
                class="btn btn-outline"
                style="padding: 6px 12px; font-size: 14px; margin-top: 8px; display: inline-block;"
              >
                View Chapters
              </a>
            ) : (
              <a
                href={`/fiction/${fiction.id}`}
                class="btn btn-outline"
                style="padding: 6px 12px; font-size: 14px; margin-top: 8px; display: inline-block;"
              >
                Start Reading
              </a>
            )}
          </>
        )}

        {showDescription && fiction.description && (
          <div
            id={`desc-${fiction.id}`}
            class="fiction-desc"
            style="display: none; margin-top: 8px; padding: 8px; font-size: 14px; border-left: 3px solid #000;"
            safe
          >
            {fiction.description}
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Description toggle script (ES5 compatible)
 * Include once per page that uses description toggles
 */
export function DescriptionToggleScript(): JSX.Element {
  return (
    <script>
      {`(function() {
  var toggles = document.querySelectorAll('.desc-toggle');
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].onclick = function() {
      var targetId = this.getAttribute('data-target');
      var target = document.getElementById(targetId);
      if (target) {
        if (target.style.display === 'none') {
          target.style.display = 'block';
          this.textContent = 'Hide';
        } else {
          target.style.display = 'none';
          this.textContent = 'Info';
        }
      }
    };
  }
})();`}
    </script>
  );
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
