import React from 'react'
import clsx from 'clsx'
import { useBlogPost } from '@docusaurus/theme-common/internal'
import EditThisPage from '@theme/EditThisPage'
import TagsListInline from '@theme/TagsListInline'
import Tag from '@theme/Tag'
import ReadMoreLink from '@theme/BlogPostItem/Footer/ReadMoreLink'
import { Icon } from '@iconify/react'
import { ReadingTime } from '../Header/Info/index'

import styles from './styles.module.scss'

export default function BlogPostItemFooter(): JSX.Element | null {
  const { metadata, isBlogPostPage } = useBlogPost()
  const {
    tags,
    title,
    editUrl,
    hasTruncateMarker,
    date,
    formattedDate,
    readingTime,
  } = metadata

  // A post is truncated if it's in the "list view" and it has a truncate marker
  const truncatedPost = !isBlogPostPage && hasTruncateMarker

  const tagsExists = tags.length > 0

  const renderFooter = isBlogPostPage

  if (!renderFooter) {
    return (
      <>
        <div className={styles.blogPostInfo}>
          {date && (
            <>
              <Icon icon="ri:calendar-fill" color="#9ca3af" />
              <time
                dateTime={date}
                className={styles.blogPostDate}
                itemProp="datePublished"
              >
                {formattedDate}
              </time>
            </>
          )}
          {tagsExists && (
            <>
              <Icon icon="ri:price-tag-3-fill" color="#9ca3af" />
              <span className={styles.blogPostInfoTags}>
                {tags.map(({ label, permalink: tagPermalink }) => (
                  <Tag
                    label={label}
                    permalink={tagPermalink}
                    key={tagPermalink}
                  />
                ))}
              </span>
            </>
          )}
          {readingTime && (
            <>
              <Icon icon="ri:time-fill" color="#9ca3af" />
              <span
                className={clsx(styles.blogPostReadTime, 'blog__readingTime')}
              >
                <ReadingTime readingTime={readingTime} />
              </span>
            </>
          )}
          {truncatedPost && (
            <div
              className={clsx(styles.readMore, {
                'col--3': tagsExists,
              })}
            >
              <ReadMoreLink blogPostTitle={title} to={metadata.permalink} />
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <footer
      className={clsx(
        'row docusaurus-mt-lg',
        isBlogPostPage && styles.blogPostFooterDetailsFull,
      )}
    >
      {tagsExists && (
        <div className={clsx('col', { 'col--9': truncatedPost })}>
          <TagsListInline tags={tags} />
        </div>
      )}

      {isBlogPostPage && editUrl && (
        <div className="col margin-top--sm">
          <EditThisPage editUrl={editUrl} />
        </div>
      )}

      {truncatedPost && (
        <div
          className={clsx('col text--right', {
            'col--3': tagsExists,
          })}
        >
          <ReadMoreLink blogPostTitle={title} to={metadata.permalink} />
        </div>
      )}
    </footer>
  )
}
