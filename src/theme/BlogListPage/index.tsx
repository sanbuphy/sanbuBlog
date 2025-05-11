import clsx from 'clsx'
import React, { useState, useRef, useEffect } from 'react'
import {
  HtmlClassNameProvider,
  PageMetadata,
  ThemeClassNames,
} from '@docusaurus/theme-common'
import BackToTopButton from '@theme/BackToTopButton'
import type { Props } from '@theme/BlogListPage'
import BlogListPaginator from '@theme/BlogListPaginator'
import BlogPostItems from '@theme/BlogPostItems'
import SearchMetadata from '@theme/SearchMetadata'

import { useViewType } from '@site/src/hooks/useViewType'
import Translate from '@docusaurus/Translate'
import { Icon } from '@iconify/react'
import BlogPostGridItems from '../BlogPostGridItems'

import styles from './styles.module.scss'
import MyLayout from '../MyLayout'
import { usePluginData } from '@docusaurus/useGlobalData'
import type { BlogTags } from '@docusaurus/plugin-content-blog'

function BlogListPageMetadata(props: Props): JSX.Element {
  const { metadata } = props
  const { blogDescription } = metadata

  return (
    <>
      <PageMetadata title={`Blog`} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  )
}

function ViewTypeSwitch(): JSX.Element {
  return (
    <div className={styles.blogSwithView}>
      <Icon
        icon="ph:grid-four"
        width="24"
        height="24"
        color="var(--ifm-color-primary)"
      />
    </div>
  )
}

function BlogListPageContent(props: Props) {
  const { metadata, items } = props

  // 获取所有标签
  const { tags } = usePluginData('docusaurus-plugin-content-blog') as { tags: BlogTags }
  const tagList = Object.values(tags)

  // 当前选中标签
  const [selectedTag, setSelectedTag] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownRef])

  // 获取当前选中标签名称
  const getSelectedTagName = () => {
    if (!selectedTag) return '全部'
    const tag = tagList.find(tag => tag.permalink === selectedTag)
    return tag ? tag.label : '全部'
  }

  // 根据标签筛选 items
  const filteredItems = selectedTag
    ? items.filter(({ content }) =>
        content.metadata.tags.some((tag: any) => tag.permalink === selectedTag)
      )
    : items

  return (
    <MyLayout>
      <h2 className={styles.blogTitle}>
        Blog
      </h2>
      
      {/* 自定义下拉菜单 */}
      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>按标签筛选：</span>
        <div ref={dropdownRef} className={styles.customDropdown}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={styles.dropdownButton}
          >
            {getSelectedTagName()}
            <Icon
              icon={isDropdownOpen ? "ri:arrow-up-s-line" : "ri:arrow-down-s-line"}
              width="18"
              height="18"
            />
          </button>
          
          {isDropdownOpen && (
            <ul className={styles.dropdownMenu}>
              <li 
                className={clsx(styles.dropdownItem, !selectedTag && styles.dropdownItemActive)}
                onClick={() => {
                  setSelectedTag('');
                  setIsDropdownOpen(false);
                }}
              >
                全部
              </li>
              
              {tagList.map(tag => (
                <li
                  key={tag.permalink}
                  className={clsx(
                    styles.dropdownItem,
                    selectedTag === tag.permalink && styles.dropdownItemActive
                  )}
                  onClick={() => {
                    setSelectedTag(tag.permalink);
                    setIsDropdownOpen(false);
                  }}
                >
                  {tag.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className={styles.separator}></div>
      <div className="row">
        <div className={'col col--12'}>
          <>
            <div className={styles.blogList}>
              <BlogPostGridItems items={filteredItems} />
            </div>
          </>
          <BlogListPaginator metadata={metadata} />
        </div>
      </div>
      <BackToTopButton />
    </MyLayout>
  )
}

export default function BlogListPage(props: Props): JSX.Element {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  )
}
