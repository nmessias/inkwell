/**
 * Chapter reader page template
 * Uses SPA-style navigation with click-based pagination
 */
import { ReaderLayout } from "../layout";
import type { ChapterContent } from "../../types";
import type { ReaderSettings } from "../../config";
import { DEFAULT_READER_SETTINGS } from "../../config";

/**
 * Chapter reader page - paginated for e-ink (SPA-style navigation)
 */
export function ReaderPage({
  chapter,
  settings = DEFAULT_READER_SETTINGS,
  initialPage = 1,
}: {
  chapter: ChapterContent;
  settings?: ReaderSettings;
  initialPage?: number;
}): JSX.Element {
  // Extract chapter IDs from URLs
  const prevChapterId = chapter.prevChapterUrl
    ? chapter.prevChapterUrl.replace("/chapter/", "")
    : "";
  const nextChapterId = chapter.nextChapterUrl
    ? chapter.nextChapterUrl.replace("/chapter/", "")
    : "";

  // Pre-render settings for no-flash display
  const fontSizeStyle = `font-size: ${settings.font}px;`;
  const fontSizeDisplay = settings.font + "px";

  return (
    <ReaderLayout title={chapter.title} settings={settings} initialPage={initialPage}>
      <header class="reader-header">
        <div class="header-left">
          <span class="remote-icon" id="remote-icon">Remote</span>
          <h1 class="chapter-title" safe>
            {chapter.title}
          </h1>
          {chapter.fictionTitle && (
            <a href={`/fiction/${chapter.fictionId}`} class="fiction-link" safe>
              {chapter.fictionTitle}
            </a>
          )}
        </div>
        <div class="header-right">
          <div class="header-nav">
            <a href="/">Home</a>
            <a href="/follows">Follows</a>
            <a href="/history">History</a>
          </div>
          <button class="settings-btn">Aa</button>
        </div>
      </header>

      <div
        class="reader-wrapper"
        data-chapter-id={chapter.id}
        data-fiction-id={chapter.fictionId}
      >
        <div class="tap-zone-top"></div>
        <div class="tap-zone-bottom"></div>
        <div class="click-zone click-zone-left"></div>
        <div class="click-zone click-zone-right"></div>
        <div class="reader-content" style={fontSizeStyle}>
          {/* Content is already HTML, render as-is */}
          {chapter.content as "safe"}
        </div>
      </div>

      <div class="page-indicator">1 / 1</div>

      <nav class="nav-fixed">
        <button
          class="btn nav-prev"
          data-chapter-id={prevChapterId || ''}
          disabled={!prevChapterId}
        >
          ← Prev Ch
        </button>
        <a href={`/fiction/${chapter.fictionId}`} class="btn btn-outline">
          Index
        </a>
        <button
          class="btn nav-next"
          data-chapter-id={nextChapterId || ''}
          disabled={!nextChapterId}
        >
          Next Ch →
        </button>
      </nav>

      <div class="settings-modal">
        <div class="settings-panel">
          <h2>Settings</h2>
          <div class="settings-row">
            <label>Font Size</label>
            <div class="font-controls">
              <button class="font-decrease">-</button>
              <span class="font-size-display">{fontSizeDisplay}</span>
              <button class="font-increase">+</button>
            </div>
          </div>

          <div class="settings-row">
            <label>Remote Control</label>
            <div class="remote-controls">
              <button class="remote-btn" id="remote-btn">Enable</button>
              <button class="remote-btn remote-disable" id="remote-disable-btn" style="display: none;">Disable</button>
            </div>
          </div>

          <div class="remote-reconnect" id="remote-reconnect" style="display: none;">
            <p>Previous remote session found</p>
            <button class="remote-btn" id="remote-reconnect-btn">Tap to reconnect</button>
          </div>
          
          <div class="remote-qr" id="remote-qr" style="display: none;">
            <p style="margin-bottom: 10px; font-size: 14px;">Scan with your phone:</p>
            <img id="remote-qr-img" alt="QR Code" style="width: 200px; height: 200px; background: #eee;" />
            <p class="remote-status" id="remote-status">Waiting for connection...</p>
          </div>

          <button class="settings-close">Close</button>
        </div>
      </div>
    </ReaderLayout>
  );
}
