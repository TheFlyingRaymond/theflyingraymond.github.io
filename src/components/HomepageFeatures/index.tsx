import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
  link: string;
  color: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Knowledge Sharing',
    icon: '📚',
    description: (
      <>
        Sharing insights from my learning journey across various fields. From technology and programming to personal growth and creative pursuits, documenting the path of continuous learning.
      </>
    ),
    link: '/docs/intro',
    color: '#3b82f6',
  },
  {
    title: 'Life Stories',
    icon: '✍️',
    description: (
      <>
        Personal reflections, experiences, and thoughts on life's journey. Every story is a piece of the puzzle that makes us who we are, shared with authenticity and heart.
      </>
    ),
    link: '/blog',
    color: '#2563eb',
  },
  {
    title: 'Creative Projects',
    icon: '🚀',
    description: (
      <>
        Exploring creativity through various projects and experiments. Whether it's coding, writing, or other creative endeavors, sharing the process and outcomes of bringing ideas to life.
      </>
    ),
    link: '/projects',
    color: '#1d4ed8',
  },
  {
    title: 'Connect & Share',
    icon: '💬',
    description: (
      <>
        Building meaningful connections through shared experiences and conversations. Let's learn from each other, grow together, and create a community of curious minds.
      </>
    ),
    link: '/contact',
    color: '#1e40af',
  },
];

function Feature({title, icon, description, link, color}: FeatureItem) {
  return (
    <div className={clsx('col col--6 col--offset-0')}>
      <Link to={link} className={styles.featureCard}>
        <div className={styles.featureIcon} style={{backgroundColor: color}}>
          <span className={styles.iconEmoji}>{icon}</span>
        </div>
        <div className={styles.featureContent}>
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
        <div className={styles.featureArrow}>→</div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresHeader}>
          <Heading as="h2" className={styles.featuresTitle}>
            Explore My World
          </Heading>
          <p className={styles.featuresSubtitle}>
            A space where learning, creativity, and life experiences come together. Discover stories, insights, and projects that reflect the journey of growth and discovery.
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
