import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export default function TableOfContents({ className }: TableOfContentsProps): React.JSX.Element {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // 提取页面中的标题
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingList: HeadingItem[] = Array.from(headingElements).map((heading) => ({
      id: heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      text: heading.textContent || '',
      level: parseInt(heading.tagName.charAt(1)),
    }));

    setHeadings(headingList);

    // 监听滚动事件，高亮当前可见的标题
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // 添加一些偏移量

      for (let i = headingList.length - 1; i >= 0; i--) {
        const element = document.getElementById(headingList[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(headingList[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始调用

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) {
    return <div />;
  }

  return (
    <div className={`${styles.tableOfContents} ${className || ''}`}>
      <div className={styles.title}>目录</div>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`${styles.item} ${styles[`level${heading.level}`]} ${
                activeId === heading.id ? styles.active : ''
              }`}
            >
              <a
                href={`#${heading.id}`}
                className={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(heading.id);
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
