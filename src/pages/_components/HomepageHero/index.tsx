// 开局页面的自我介绍相关
import React from 'react'
import { motion } from 'framer-motion' // Import motion from framer-motion

import Translate from '@docusaurus/Translate'

import HeroMain from './img/hero_main.svg'

import styles from './styles.module.scss'
import SocialLinks from '@site/src/components/SocialLinks'

const variants = {
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
      duration: 0.3,
      delay: i * 0.3,
    },
  }),
  hidden: { opacity: 0, y: 30 },
}

function Hero() {
  return (
    <motion.div className={styles.hero}>
      <div className={styles.bloghome__intro}>
        <motion.div
          className={styles.hero_text}
          custom={1}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          {/* <Translate id="homepage.hero.greet">你好! 我是</Translate>
          <span className={styles.intro__name}> */}
            {/* <Translate id="homepage.hero.name">散步</Translate> */}
          {/* </span> */}
        </motion.div>
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <Translate id="homepage.hero.text">
            {`I am interested in AI and enjoy asking "why". If you share the same interests, 
            feel free to ask me any strange questions and we can discuss and research together. (博客施工中...) 欢迎到 blog 中留言与我交流。 在这个新家修缮完成前，你也可以访问我的旧家👇`}
          </Translate>
        </motion.p>
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <SocialLinks />
        </motion.div>

        <motion.div
          className={styles.buttonGroup}
          custom={3}
          initial="hidden"
          animate="visible"
          variants={variants}
        >

          <div className={styles.outer}>
            <div className={styles.gradient} />
            <a className={styles.button} href={'./about'}>
              <Translate id="hompage.hero.introduce">🤔 关于我</Translate>
            </a>
          </div>
          <div className={styles.outer}>
            <div className={styles.gradient} />
            <a className={styles.button} href={'./blog'}>
              <Translate id="hompage.hero.introduce">🌟 Blog</Translate>
            </a>
          </div>
          <div className={styles.outer}>
            <div className={styles.gradient} />
            <a className={styles.button} href={'https://sanbuphy.github.io/'}>
              <Translate id="hompage.hero.introduce">🏠 旧家</Translate>
            </a>
          </div>
        </motion.div>
      </div>
      <div className={styles.bloghome__image}>
        <HeroMain />
      </div>
    </motion.div>
  )
}

export default Hero
