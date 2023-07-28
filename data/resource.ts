import { Friends } from './friend'

export interface Resource {
  name: string
  logo: string
  desc: string
  href: string
  tags?: string[]
}

export interface ResourceCategory {
  name: string
  resources: Resource[]
}

const friends: Resource[] = Friends.map(f => {
  return {
    ...f,
    name: f.title,
    desc: f.description,
    logo: f.avatar,
    href: f.website,
  }
})

export const resourceData: ResourceCategory[] = [
  {
    name: '友链',
    resources: friends,
  },
  {
    name: '每周必看',
    resources: [
      {
        name: '稀土掘金',
        desc: '稀土掘金是一个技术博客平台，是程序员发布自己的技术文章、分享知识的地方',
        logo: '/img/resource/juejin.png',
        href: 'https://juejin.cn/',
      },
      {
        name: 'GitHub Repositories Trending',
        desc: '掌握github最新趋势',
        logo: '/img/resource/github.ico',
        href: 'https://github.com/trending',
        tags: [],
      },
    ],
  },
  {
    name: 'AI',
    resources: [
      {
        name: 'Gamma',
        desc: 'Generate docs, decks & webpages in seconds',
        logo: '/img/resource/github.ico',
        href: 'https://gamma.app/',
      },
      {
        name: 'github Topics',
        desc: 'Browse popular topics on GitHub.',
        logo: '/img/resource/github.ico',
        href: 'https://github.com/topics',
        tags: [],
      },
    
    ],
  },
  {
    name: 'Github',
    resources: [
      {
        name: 'Metrics',
        desc: 'Create your own metrics',
        logo: '/img/resource/github.ico',
        href: 'https://metrics.lecoq.io/',
        tags: [],
      },
      {
        name: 'Github主页 README 生成器',
        desc: '一个Github 个人主页 README 生成器',
        logo: '/img/resource/github.ico',
        href: 'https://rahuldkjain.github.io/gh-profile-readme-generator/',
        tags: [],
      },
      {
        name: 'Github 统计生成器',
        desc: 'Github 在你的 README 中获取动态生成的 GitHub 统计信息！',
        logo: '/img/resource/github.ico',
        href: 'https://github.com/anuraghazra/github-readme-stats',
        tags: [],
      },
    ],
  },
]
