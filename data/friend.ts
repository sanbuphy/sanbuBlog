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
]

export type Friend = {
  title: string
  description: string
  website: string
  avatar?: any
}
