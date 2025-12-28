/**
 * Follows page template
 */
import { Layout } from "../layout";
import { Nav, FictionCard, Pagination, paginate } from "../components";
import type { ReaderSettings } from "../../config";
import { DEFAULT_READER_SETTINGS } from "../../config";
import type { FollowedFiction } from "../../types";

export function FollowsPage({
  fictions,
  page = 1,
  settings = DEFAULT_READER_SETTINGS,
}: {
  fictions: FollowedFiction[];
  page?: number;
  settings?: ReaderSettings;
}): JSX.Element {
  if (fictions.length === 0) {
    return (
      <Layout title="My Follows" settings={settings}>
        <Nav currentPath="/follows" />
        <h1>My Follows</h1>
        <p>
          No followed fictions found. Make sure your cookies are configured in{" "}
          <a href="/setup">Setup</a>.
        </p>
      </Layout>
    );
  }

  const paginatedFictions = paginate(fictions, page);

  return (
    <Layout title="My Follows" settings={settings}>
      <Nav currentPath="/follows" />
      <h1>My Follows ({fictions.length})</h1>
      <ul>
        {paginatedFictions.map((f) => (
          <FictionCard
            fiction={f}
            showContinue={true}
            showUnread={true}
            showLatestChapter={true}
            showLastRead={true}
          />
        ))}
      </ul>
      <Pagination currentPage={page} totalItems={fictions.length} basePath="/follows" />
    </Layout>
  );
}
