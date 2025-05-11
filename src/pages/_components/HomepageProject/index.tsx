import React from 'react'
import clsx from 'clsx'
import { Project, projects } from '@site/data/project'
import styles from './styles.module.scss'
import SectionTitle from '../SectionTitle'

// 简化URL显示
const removeHttps = (url: string) => {
  return url.replace(/(^\w+:|^)\/\//, '')
}

const showProjects = projects.filter(i => i.preview)

// 静态项目展示组件
const ProjectList = ({ items }: { items: Project[] }) => {
  return (
    <div className={styles.projectList}>
      {items.map((item, index) => (
        <div className={styles.projectItem} key={index}>
          <a href={item.website} target="_blank" rel="noopener noreferrer">
            <div className={styles.projectBody}>
              <h2 className={styles.title}>{item.title}</h2>
              {/* 为TIANJI项目显示特殊介绍 */}
              {item.title === 'Tianji' ? (
                <div className={styles.descriptionWrapper}>
                  <p className={styles.description}>
                    Creating LLMs with social intelligence | Covering prompt engineering, RAG, Agents, and LLM fine-tuning tutorials
                  </p>
                </div>
              ) : (
                <p className={styles.website}>{removeHttps(item.website)}</p>
              )}
            </div>
          </a>
        </div>
      ))}
    </div>
  )
}

const HomepageProject = () => {
  return (
    <section className={clsx('container padding-vert--sm', styles.projectContainer)}>
      <div className={styles.sectionHeader}>
        <SectionTitle href={'/project'}>
          Open Source Projects
        </SectionTitle>
      </div>
      <div className={styles.content}>
        <ProjectList items={showProjects} />
      </div>
    </section>
  )
}

export default HomepageProject
