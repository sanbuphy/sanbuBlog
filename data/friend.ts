export const Friends: Friend[] = [
  {
    title: '阿尼亚', 
    description: 'c++ 游戏引擎',
    website: 'https://anya.cool/',
    avatar: '/img/friend/aniya.jpg',
  },
  {
    title: 'hiki',
    description: 'Nvidia',
    website: 'https://aneureka.cn/',
    avatar: '/img/friend/hiki.webp',
  },
  {
    title: 'sonder',
    description: '深度学习框架,开源社区',
    website: 'https://space.keter.top/',
    avatar: '/img/friend/sonder.jpeg',
  },
  {
    title: 'linxu',
    description: '深度学习 & 开源社区，大模型',
    website: 'https://www.cnblogs.com/isLinXu/',
    avatar: '/img/friend/linxu.jpeg',
  },
  {
    title: 'jackzhu',
    description: '开源社区 & 多模态',
    website: 'https://jackzhu.top/',
    avatar: '/img/friend/mingzi.jpg',
  },
]

export type Friend = {
  title: string
  description: string
  website: string
  avatar?: any
}
