/**
 * Fiction detail page template
 */
import { Layout } from "../layout";
import { Nav, Pagination } from "../components";
import type { ReaderSettings } from "../../config";
import { DEFAULT_READER_SETTINGS, CHAPTERS_PER_PAGE } from "../../config";
import type { Fiction } from "../../types";

export function FictionPage({
  fiction,
  chapterPage = 1,
  settings = DEFAULT_READER_SETTINGS,
}: {
  fiction: Fiction;
  chapterPage?: number;
  settings?: ReaderSettings;
}): JSX.Element {
  const chapters = fiction.chapters || [];
  const totalChapterPages = Math.ceil(chapters.length / CHAPTERS_PER_PAGE);
  const startIdx = (chapterPage - 1) * CHAPTERS_PER_PAGE;
  const paginatedChapters = chapters.slice(startIdx, startIdx + CHAPTERS_PER_PAGE);

  const stats = fiction.stats;
  const statsLine = [
    stats?.rating ? `${stats.rating.toFixed(1)}★` : null,
    stats?.pages ? `${stats.pages} pages` : null,
    stats?.followers ? `${stats.followers.toLocaleString()} followers` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const hasLongDesc = fiction.description && fiction.description.length > 300;

  return (
    <Layout title={fiction.title} settings={settings}>
      <Nav />
      <div class="fiction-header" style="display: flex; gap: 16px; margin-bottom: 16px;">
        {fiction.coverUrl && (
          <div class="fiction-cover">
            <img
              src={fiction.coverUrl}
              alt={fiction.title}
              style="max-width: 150px; max-height: 200px; border: 1px solid #000;"
            />
          </div>
        )}
        <div class="fiction-info" style="flex: 1;">
          <h1 style="margin: 0 0 8px 0;" safe>
            {fiction.title}
          </h1>
          <div class="fiction-meta">
            by <span safe>{fiction.author || "Unknown"}</span>
            {statsLine && ` • ${statsLine}`}
          </div>
        </div>
      </div>

      {fiction.description && (
        <div
          class="fiction-description"
          style="margin: 16px 0; padding: 12px; border-left: 3px solid #000;"
        >
          <strong>Description:</strong>
          {hasLongDesc ? (
            <>
              <p id="desc-short" style="margin: 8px 0 0 0;">
                <span safe>{fiction.description.slice(0, 300)}</span>...
                <button
                  id="desc-expand"
                  style="padding: 2px 8px; font-size: 12px; background: #fff; border: 1px solid #000; cursor: pointer;"
                >
                  Show More
                </button>
              </p>
              <p id="desc-full" style="display: none; margin: 8px 0 0 0;">
                <span safe>{fiction.description}</span>
                <button
                  id="desc-collapse"
                  style="padding: 2px 8px; font-size: 12px; background: #fff; border: 1px solid #000; cursor: pointer;"
                >
                  Show Less
                </button>
              </p>
            </>
          ) : (
            <p style="margin: 8px 0 0 0;" safe>
              {fiction.description}
            </p>
          )}
        </div>
      )}

      {fiction.continueChapterId ? (
        <a
          href={`/chapter/${fiction.continueChapterId}`}
          class="btn"
          style="margin-bottom: 16px; display: block; text-align: center;"
        >
          Continue Reading
        </a>
      ) : (
        chapters.length > 0 && (
          <a
            href={`/chapter/${chapters[0].id}`}
            class="btn btn-outline"
            style="margin-bottom: 16px; display: block; text-align: center;"
          >
            Start Reading
          </a>
        )
      )}

      <h2>Chapters ({chapters.length})</h2>
      <ul class="chapter-list">
        {paginatedChapters.length > 0 ? (
          paginatedChapters.map((c, i) => (
            <li>
              <a href={`/chapter/${c.id}`} safe>
                {c.title || `Chapter ${startIdx + i + 1}`}
              </a>
              {c.date && (
                <span class="fiction-meta">
                  {" "}
                  • <span safe>{c.date}</span>
                </span>
              )}
            </li>
          ))
        ) : (
          <li>No chapters found</li>
        )}
      </ul>

      {totalChapterPages > 1 && (
        <Pagination
          currentPage={chapterPage}
          totalItems={chapters.length}
          basePath={`/fiction/${fiction.id}`}
          itemsPerPage={CHAPTERS_PER_PAGE}
        />
      )}

      <div style="margin-top: 16px;">
        <a href="/follows" class="btn btn-outline">
          Back to Follows
        </a>
      </div>

      {hasLongDesc && (
        <script>
          {`(function() {
  var expandBtn = document.getElementById('desc-expand');
  var collapseBtn = document.getElementById('desc-collapse');
  var shortDesc = document.getElementById('desc-short');
  var fullDesc = document.getElementById('desc-full');
  if (expandBtn) {
    expandBtn.onclick = function() {
      shortDesc.style.display = 'none';
      fullDesc.style.display = 'block';
    };
  }
  if (collapseBtn) {
    collapseBtn.onclick = function() {
      shortDesc.style.display = 'block';
      fullDesc.style.display = 'none';
    };
  }
})();`}
        </script>
      )}
    </Layout>
  );
}
