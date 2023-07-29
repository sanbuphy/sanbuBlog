export const Friends: Friend[] = [
  {
    title: '阿尼亚', 
    description: 'c++语言律师',
    website: 'https://anya.cool/',
    avatar: '/img/friend/aniya.jpg',
  },
  {
    title: 'hiki',
    description: 'c++大佬',
    website: 'https://aneureka.cn/',
    avatar: '/img/friend/hiki.webp',
  },
  {
    title: 'sonder',
    description: '深度学习底层冉冉升起的新星,开源社区大佬',
    website: 'https://space.keter.top/',
    avatar: '/img/friend/sonder.jpeg',
  },
]

export type Friend = {
  title: string
  description: string
  website: string
  avatar?: any
}
