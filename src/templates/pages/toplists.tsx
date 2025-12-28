/**
 * Toplists index and toplist detail page templates
 */
import { Layout } from "../layout";
import { Nav, FictionCard, Pagination, paginate, DescriptionToggleScript } from "../components";
import type { ReaderSettings, ToplistType } from "../../config";
import { DEFAULT_READER_SETTINGS, TOPLISTS, ITEMS_PER_PAGE } from "../../config";
import type { Fiction } from "../../types";

/**
 * Toplists index page - shows all available toplists
 */
export function ToplistsPage({
  settings = DEFAULT_READER_SETTINGS,
}: {
  settings?: ReaderSettings;
}): JSX.Element {
  return (
    <Layout title="Top Lists" settings={settings}>
      <Nav currentPath="/toplists" />
      <h1>Top Lists</h1>
      <ul>
        {TOPLISTS.map((t) => (
          <li>
            <a href={`/toplist/${t.slug}`} class="fiction-title" safe>
              {t.name}
            </a>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

/**
 * Single toplist page - shows fictions from a specific toplist
 */
export function ToplistPage({
  toplist,
  fictions,
  page = 1,
  settings = DEFAULT_READER_SETTINGS,
}: {
  toplist: ToplistType;
  fictions: Fiction[];
  page?: number;
  settings?: ReaderSettings;
}): JSX.Element {
  if (fictions.length === 0) {
    return (
      <Layout title={toplist.name} settings={settings}>
        <Nav currentPath="/toplists" />
        <h1 safe>{toplist.name}</h1>
        <p>No fictions found. Try again later.</p>
        <a href="/toplists" class="btn">
          Back to Top Lists
        </a>
      </Layout>
    );
  }

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedFictions = paginate(fictions, page);

  return (
    <Layout title={toplist.name} settings={settings}>
      <Nav currentPath="/toplists" />
      <h1 safe>{toplist.name}</h1>
      <ul>
        {paginatedFictions.map((f, i) => (
          <FictionCard fiction={f} rank={startIndex + i + 1} showDescription={true} />
        ))}
      </ul>
      <Pagination
        currentPage={page}
        totalItems={fictions.length}
        basePath={`/toplist/${toplist.slug}`}
      />
      <div style="margin-top: 16px;">
        <a href="/toplists" class="btn btn-outline">
          Back to Top Lists
        </a>
      </div>
      <DescriptionToggleScript />
    </Layout>
  );
}
