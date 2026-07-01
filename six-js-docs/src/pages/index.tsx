// C:\Users\nguye\OneDrive\Máy tính\six-js-librari\six-js-docs\src\pages\index.tsx
import type { ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import GettingStartedContent from "../../docs/_Getting-Started.md";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <div className="container margin-vert--lg markdown">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <GettingStartedContent />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}