import React from 'react'
import clsx from 'clsx'
import Translate, { translate } from '@docusaurus/Translate'
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  usePluralForm,
} from '@docusaurus/theme-common'
import Link from '@docusaurus/Link'
import BackToTopButton from '@theme/BackToTopButton'
import BlogListPaginator from '@theme/BlogListPaginator'
import SearchMetadata from '@theme/SearchMetadata'
import type { Props } from '@theme/BlogTagsPostsPage'
import BlogPostItems from '@theme/BlogPostItems'
import BlogPostGridItems from '../BlogPostGridItems'
import Unlisted from '@theme/Unlisted'
import Heading from '@theme/Heading'
import { Icon } from '@iconify/react'

import styles from './styles.module.scss'
import MyLayout from '../MyLayout'

// Very simple pluralization: probably good enough for now
function useBlogPostsPlural() {
  const { selectMessage } = usePluralForm()
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          id: 'theme.blog.post.plurals',
          description:
            'Pluralized label for "{count} posts". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: 'One post|{count} posts',
        },
        { count },
      ),
    )
}

function useBlogTagsPostsPageTitle(tag: Props['tag']): string {
  const blogPostsPlural = useBlogPostsPlural()
  return translate(
    {
      id: 'theme.blog.tagTitle',
      description: 'The title of the page for a blog tag',
      message: '{nPosts} tagged with "{tagName}"',
    },
    { nPosts: blogPostsPlural(tag.count), tagName: tag.label },
  )
}

function BlogTagsPostsPageMetadata({ tag }: Props): JSX.Element {
  const title = useBlogTagsPostsPageTitle(tag)
  return (
    <>
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_tags_posts" />
    </>
  )
}

function BlogTagsPostsPageContent({
  tag,
  items,
  sidebar,
  listMetadata,
}: Props): JSX.Element {
  const title = useBlogTagsPostsPageTitle(tag)
  // Force grid view
  const isGridView = true

  return (
    <MyLayout>
      {tag.unlisted && <Unlisted />}
      <header className={clsx(styles.pageHeader)}>
        <div className={styles.headerLeft}>
          <Link href="/blog" className={styles.backButton}>
            <Icon icon="ri:arrow-left-line" width="20" height="20" />
            <span>Back to Blog</span>
          </Link>
          <Heading as="h1">{title}</Heading>
        </div>
        <Link href={tag.allTagsPath}>
          <Translate
            id="theme.tags.tagsPageLink"
            description="The label of the link targeting the tag list page"
          >
            View All Tags
          </Translate>
        </Link>
      </header>
      <div className={styles.separator}></div>
      <div className="row">
        <div className={'col col--12'}>
          <>
            {isGridView && (
              <div className={styles.blogGrid}>
                <BlogPostGridItems items={items} />
              </div>
            )}
          </>
          <BlogListPaginator metadata={listMetadata} />
        </div>
      </div>
      <BackToTopButton />
    </MyLayout>
  )
}

export default function BlogTagsPostsPage(props: Props): JSX.Element {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagPostListPage,
      )}
    >
      <BlogTagsPostsPageMetadata {...props} />
      <BlogTagsPostsPageContent {...props} />
    </HtmlClassNameProvider>
  )
}
