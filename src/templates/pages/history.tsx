/**
 * History page template
 */
import { Layout } from "../layout";
import { Nav, Pagination, paginate } from "../components";
import type { ReaderSettings } from "../../config";
import { DEFAULT_READER_SETTINGS } from "../../config";
import type { HistoryEntry } from "../../types";

export function HistoryPage({
  history,
  page = 1,
  settings = DEFAULT_READER_SETTINGS,
}: {
  history: HistoryEntry[];
  page?: number;
  settings?: ReaderSettings;
}): JSX.Element {
  if (history.length === 0) {
    return (
      <Layout title="History" settings={settings}>
        <Nav currentPath="/history" />
        <h1>History</h1>
        <p>
          No reading history found. Make sure your cookies are configured in{" "}
          <a href="/setup">Setup</a>.
        </p>
      </Layout>
    );
  }

  const paginatedHistory = paginate(history, page);

  return (
    <Layout title="History" settings={settings}>
      <Nav currentPath="/history" />
      <h1>History ({history.length})</h1>
      <ul>
        {paginatedHistory.map((h) => (
          <li class="fiction-item">
            <div class="fiction-title">
              <a href={`/chapter/${h.chapterId}`} safe>
                {h.chapterTitle}
              </a>
            </div>
            <div class="fiction-meta">
              <a href={`/fiction/${h.fictionId}`} safe>
                {h.fictionTitle}
              </a>
            </div>
            <div class="fiction-meta" safe>
              {h.readAt}
            </div>
          </li>
        ))}
      </ul>
      <Pagination currentPage={page} totalItems={history.length} basePath="/history" />
    </Layout>
  );
}
