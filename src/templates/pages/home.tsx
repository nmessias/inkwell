/**
 * Home page template
 */
import { Layout } from "../layout";
import { Nav } from "../components";
import type { ReaderSettings } from "../../config";
import { DEFAULT_READER_SETTINGS } from "../../config";

export function HomePage({
  settings = DEFAULT_READER_SETTINGS,
}: {
  settings?: ReaderSettings;
}): JSX.Element {
  return (
    <Layout title="Home" settings={settings}>
      <Nav currentPath="/" />
      <h1>E-ink Royal</h1>
      <p>Royal Road proxy optimized for Kindle e-ink browsers.</p>
      <ul>
        <li>
          <a href="/follows">My Follows</a> - View your followed fictions
        </li>
        <li>
          <a href="/history">History</a> - Recently read chapters
        </li>
        <li>
          <a href="/toplists">Top Lists</a> - Browse popular fictions
        </li>
        <li>
          <a href="/search">Search</a> - Find fictions by title
        </li>
        <li>
          <a href="/cache">Cache</a> - Manage cached data
        </li>
        <li>
          <a href="/setup">Setup</a> - Configure session cookies
        </li>
      </ul>
    </Layout>
  );
}
