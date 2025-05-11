import React, { useState } from 'react'
import { usePluginData } from '@docusaurus/useGlobalData'
import type { BlogTags } from '@docusaurus/plugin-content-blog'
import { TagsListByFlat } from '../TagsListByLetter'
import { Icon } from '@iconify/react'
import styles from './styles.module.scss'

export default function BlogTagToggleWidget(): JSX.Element {
  const [showTags, setShowTags] = useState(false)
  const { tags } = usePluginData('docusaurus-plugin-content-blog') as { tags: BlogTags }

  // Format tags for TagsListByFlat component
  const formattedTags = Object.values(tags).map(tag => ({
    label: tag.label,
    permalink: tag.permalink,
    count: tag.items.length,
  }))

  const toggleTags = () => {
    setShowTags(!showTags)
  }

  return (
    <div className={styles.blogTagWidget}>
      <div className={styles.tagToggle} onClick={toggleTags}>
        <span>Filter by Tags</span>
        <Icon 
          icon={showTags ? "ri:arrow-up-s-line" : "ri:arrow-down-s-line"} 
          width="16" 
          height="16" 
        />
      </div>
      {showTags && (
        <div className={styles.tagsList}>
          <TagsListByFlat tags={formattedTags} />
        </div>
      )}
    </div>
  )
} 