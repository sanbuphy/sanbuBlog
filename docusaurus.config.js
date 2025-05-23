const path = require('path')
// const beian = '闽ICP备2020017848号-2'
const beian = ''
const announcementBarContent = ''

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SanbuBlog',
  url: 'https://aispacewalk.cn',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'sanbu',
  projectName: 'blog',
  tagline: '求知若饥 虚心若愚',
  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
  themeConfig: {  
    image: 'img/logo.jpg',
    // announcementBar: {
    //   id: 'announcementBar-3',
    //   content: announcementBarContent,
    // },
    metadata: [
      {
        name: 'keywords',
        content: '散步, sanbu',
      },
      {
        name: 'keywords',
        content: '人工智能',
      },
    ],
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: "Sanbu'log",
      hideOnScroll: true,
      items: [
        {
          label: 'Notes',
          to: 'docs/skill/',
        },
        {
          label: 'AI',
          position: 'left',
          to: 'docs/ai/',
          items: [
            {
              label: 'Mlsys',
              to: 'docs/ai/mlsys',
            },
            {
              label: 'Nvidia',
              to: 'docs/ai/nvidia/nvidia-guides',
            },
            {
              label: 'Framework',
              to: 'docs/ai/framework/introduction',
            },
            {
              label: 'Lab',
              to: 'docs/ai/lab/introduction',
            },
            {
              label: 'Notes',
              to: 'docs/ai/notes/introduction', // 不加 introduction 没办法显示。。。似乎空格之类的就挂了，最好标题不要有空格
            },
            {
              label: 'Others',
              to: 'docs/ai/other/introduction',
            },
          ],
        },
          {
          label: 'Blog',
          position: 'left',
          to: 'blog',
        },
        {
          label: 'AwesomeWeb',
          position: 'left',
          to: 'docs/other/awesomeweb',
        },
        {
          label: 'Soul',
          position: 'left',
          to: 'soul',
        },
        // {
        //   label: 'Friend',
        //   position: 'left',
        //   to: 'resource',
        // },
        // {
        //   label: 'other',
        //   position: 'left',
        //   to: 'blog',

        // },
        // {
        //   type: 'localeDropdown',
        //   position: 'right',
        // },
      ],
    },
    footer: { // 下面的栏目
      style: 'dark',
      links: [],
      copyright: `<p>Copyright © 2023 - PRESENT 散步</p>`,
    },
    prism: {
      theme: require('prism-react-renderer/themes/vsLight'),
      darkTheme: require('prism-react-renderer/themes/vsDark'),
      additionalLanguages: ['java', 'php', 'rust', 'toml'],
      defaultLanguage: 'javascript',
      magicComments: [
        {
          className: 'theme-code-block-highlighted-line',
          line: 'highlight-next-line',
          block: { start: 'highlight-start', end: 'highlight-end' },
        },
        {
          className: 'code-block-error-line',
          line: 'This will error',
        },
      ],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    algolia: {
      appId: 'GV6YN1ODMO',
      apiKey: '50303937b0e4630bec4a20a14e3b7872',
      indexName: 'sanbu',
    },
    zoom: {
      selector: '.markdown :not(em) > img',
      background: {
        light: 'rgb(255, 255, 255)',
        dark: 'rgb(50, 50, 50)',
      },
      config: {},
    },
    giscus: {
      repo: "sanbuphy/sanbuBlog",
      repoId: 'R_kgDOKAWX2g',
      category: 'General',
      categoryId: 'DIC_kwDOKAWX2s4CYLy0',
      theme: 'light',
      darkTheme: 'dark',
    },
    liveCodeBlock: {
      playgroundPosition: 'top',
    },
    socials: {
      github: 'https://github.com/sanbuphy',
      // twitter: 'https://twitter.co',
      // juejin: 'https://juejin.cn/user/1565318510545901',
      // csdn: 'https://blog.csdn.n',
      // qq: 'https://wpa.qq.com/msgrd?v=3&amp;uin=911993023&amp;site=qq',
      // zhihu: 'https://www.zhihu.com/p',
      // cloudmusic: 'https://music.163.com/#/user/home?id=1333010742',
      mail: 'physicoada@gmail.com',
    },
  },
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content: '散步的个人博客',
      },
    },
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          sidebarPath: 'sidebars.js',
        },
        blog: false,
        theme: {
          customCss: [require.resolve('./src/css/custom.scss')],
        },
        sitemap: {
          changefreq: 'daily',
          priority: 0.5,
        },
        gtag: {
          trackingID: 'G-S4SD5NXWXF',
          anonymizeIP: true,
        },
        // debug: true,
      }),
    ],
  ],
  plugins: [
    'docusaurus-plugin-image-zoom',
    'docusaurus-plugin-sass',
    // path.resolve(__dirname, './src/plugin/plugin-baidu-tongji'),
    // path.resolve(__dirname, './src/plugin/plugin-baidu-push'),
    [
      path.resolve(__dirname, './src/plugin/plugin-content-blog'),
      {
        path: 'blog',
        editUrl: ({ locale, blogDirPath, blogPath, permalink }) =>
          `https://github.com/sanbuphy/sanbuBlog/edit/main/${blogDirPath}/${blogPath}`,
        editLocalizedFiles: false,
        blogDescription: '散步的个人博客',
        blogSidebarCount: 10,
        blogSidebarTitle: 'Blogs',
        postsPerPage: 10,
        showReadingTime: true,
        readingTime: ({ content, frontMatter, defaultReadingTime }) =>
          defaultReadingTime({ content, options: { wordsPerMinute: 300 } }),
        feedOptions: {
          type: 'all',
          title: '散步',
          copyright: `Copyright © ${new Date().getFullYear()} 散步 Built with Docusaurus.<p><a href="http://beian.miit.gov.cn/" class="footer_lin">${beian}</a></p>`,
        },
      },
    ],
    [
      '@docusaurus/plugin-ideal-image',
      {
        disableInDev: false,
      },
    ],
    // [
    //   '@docusaurus/plugin-pwa',
    //   {
    //     debug: true,
    //     offlineModeActivationStrategies: [
    //       'appInstalled',
    //       'standalone',
    //       'queryString',
    //     ],
    //     pwaHead: [
    //       {
    //         tagName: 'link',
    //         rel: 'icon',
    //         href: '/img/logo.png',
    //       },
    //       {
    //         tagName: 'link',
    //         rel: 'manifest',
    //         href: '/manifest.json',
    //       },
    //       {
    //         tagName: 'meta',
    //         name: 'theme-color',
    //         content: 'rgb(51 139 255)',
    //       },
    //     ],
    //   },
    // ],
  ],
  stylesheets: [],
  // i18n: {
  //   defaultLocale: 'zh-CN',
  //   locales: ['en', 'zh-CN'],
  //   localeConfigs: {
  //     en: {
  //       htmlLang: 'en-GB',
  //     },
  //   },
  // },
}

module.exports = config
