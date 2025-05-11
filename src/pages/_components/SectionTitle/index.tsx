import React from 'react'
import { Icon } from '@iconify/react'
import Link from '@docusaurus/Link'
import Translate from '@docusaurus/Translate'

import styles from './styles.module.scss'

interface Props {
  icon?: string
  href?: string
  children: React.ReactNode
}

export default function SectionTitle({ children, icon, href }: Props) {
  return (
    <div className={styles.sectionTitle}>
      <h2>
        {/* 移除图标的显示 */}
        {children}
      </h2>
      {href && (
        <Link href={href} className={styles.moreButton}>
          {/* 更新为英文 */}
          View More
          <Icon icon="ri:arrow-right-s-line"></Icon>
        </Link>
      )}
    </div>
  )
}
