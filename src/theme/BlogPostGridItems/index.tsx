import React, { useState } from 'react'
import { Variants, motion } from 'framer-motion'
import Link from '@docusaurus/Link'
import type { Props as BlogPostItemsProps } from '@theme/BlogPostItems'
import Tag from '@theme/Tag'
import MDXContent from '@theme/MDXContent'

import styles from './styles.module.scss'

const variants: Variants = {
  from: { opacity: 0.01 },
  to: (i) => ({
    opacity: 1,
    transition: {
      duration: 0.3,
      delay: i * 0.1,
    },
  }),
}

// Component to extract the truncated content
function TruncatedContent({ children }) {
  return (
    <div className={styles.truncatedContent}>
      <MDXContent>{children}</MDXContent>
    </div>
  );
}

export default function BlogPostGridItems({
  items,
}: BlogPostItemsProps): JSX.Element {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  return (
    <>
      {items.map(({ content: BlogPostContent }, i) => {
        const { metadata: blogMetaData, frontMatter: blogPostFrontMatter } = BlogPostContent;
        const { title } = blogPostFrontMatter;
        const { description: frontMatterDescription } = blogPostFrontMatter;

        const { permalink, date, tags, description: metadataDescription, hasTruncateMarker, excerpt } = blogMetaData as any;
        const dateObj = new Date(date);
        const dateString = `${dateObj.getFullYear()}-${(
          '0' +
          (dateObj.getMonth() + 1)
        ).slice(-2)}-${('0' + dateObj.getDate()).slice(-2)}`;

        let contentForPopup: string | null = null;
        let showReadMoreLink = false;

        if (typeof frontMatterDescription === 'string' && frontMatterDescription.trim() !== '') {
            contentForPopup = `<p>${frontMatterDescription}</p>`;
            if (hasTruncateMarker) {
                showReadMoreLink = true;
            }
        } else if (hasTruncateMarker && typeof excerpt === 'string' && excerpt.trim() !== '') {
          contentForPopup = excerpt;
          showReadMoreLink = true;
        } else if (typeof metadataDescription === 'string' && metadataDescription.trim() !== '') {
          contentForPopup = `<p>${metadataDescription}</p>`;
          if (hasTruncateMarker) {
            showReadMoreLink = true;
          }
        }

        return (
          <motion.div
            className={styles.postGridItem}
            key={blogMetaData.permalink}
            initial="from"
            animate="to"
            custom={i / 2}
            viewport={{ once: true, amount: 0.8 }}
            variants={variants}
          >
            <div 
              className={styles.titleWrapper}
              onMouseEnter={() => setActiveItemId(blogMetaData.permalink)}
              onMouseLeave={() => setActiveItemId(null)}
            >
              <Link to={permalink} className={styles.itemTitle}>
                {title}
              </Link>
              
              {activeItemId === blogMetaData.permalink && contentForPopup && (
                <div className={styles.excerptPopup}>
                  <div dangerouslySetInnerHTML={{ __html: contentForPopup }} />
                  
                  {showReadMoreLink && (
                    <Link to={permalink} className={styles.readMoreLink}>
                      Read more →
                    </Link>
                  )}
                </div>
              )}
            </div>
            
            <div className={styles.itemTags}>
              {tags.length > 0 &&
                tags
                  .slice(0, 2)
                  .map(({ label, permalink: tagPermalink }) => (
                    <Tag
                      label={label}
                      permalink={tagPermalink}
                      key={tagPermalink}
                    />
                  ))}
            </div>
            <div className={styles.itemDate}>{dateString}</div>
          </motion.div>
        )
      })}
    </>
  )
}
