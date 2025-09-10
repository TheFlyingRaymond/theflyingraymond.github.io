import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className={styles.heroTitle}>
              <span className={styles.gradientText}>
                Hello, I'm Ray
              </span>
            </Heading>
            <p className={styles.heroSubtitle}>
              {siteConfig.tagline}
            </p>
            <p className={styles.heroDescription}>
              A curious soul who loves learning, sharing, and exploring life's possibilities. While technology is part of my journey, I'm equally passionate about personal growth, creative expression, and meaningful connections.
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/intro">
                📚 View Documentation
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/blog">
                📖 Read Blog
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.floatingCard}>
              <div className={styles.cardContent}>
                <div className={styles.avatar}>
                  <img 
                    src="https://avatars.githubusercontent.com/theflyingraymond" 
                    alt="Ray's Avatar" 
                    className={styles.avatarImage}
                  />
                </div>
                <h3>Ray</h3>
                <p>A prayer for the wild at the heart, kept in cages.</p>
                <div className={styles.skills}>
                  <span className={styles.skillTag}>Cycling</span>
                  <span className={styles.skillTag}>Rock Climbing</span>
                  <span className={styles.skillTag}>Marathon</span>
                  <span className={styles.skillTag}>Coding</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.heroBackground}>
        <div className={styles.gradientOrb}></div>
        <div className={styles.gradientOrb}></div>
        <div className={styles.gradientOrb}></div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
