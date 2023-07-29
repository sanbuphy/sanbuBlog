/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  skill: [
    // 这里应该是存放各种索引关联关系,也可以自动生成
    'skill/introduction',
    {
      label: 'c++的魔法',
      type: 'category',
      link: {
        type: 'doc',
        id: 'skill/cpp/cpp-guides'
      },  
      items: [
        {
          type:'autogenerated',
          dirName:'skill/cpp',
        }
      ],
    },
    {//其他
      label: '其他',
      type: 'category',
      link: {
        type: 'generated-index',
      },  
      items: [
        {
          type:'autogenerated',
          dirName:'skill/other',
        }
      ],
    },
    {//开发
      label: '开发相关',
      type: 'category',
      link: {
        type: 'generated-index',
      },  
      items: [
        {
          type:'autogenerated',
          dirName:'skill/develop',
        }
      ],
    },
  ],
  ai: [
    'ai/introduction',
    {
      label: 'Mlsys',
      type: 'category',
      link: {
        type: 'doc',
        id: 'ai/mlsys/mlsys-guides'
      },  
      items: [
        {
          type:'autogenerated',
          dirName:'ai/mlsys',
        }
      ],
    },
    {
      label: 'Nidia相关',
      type: 'category',
      link: {
        type: 'doc',
        id: 'ai/nvidia/nvidia-guides'
      },    
      items: [
        {
          type:'autogenerated',
          dirName:'ai/nvidia',
        }
      ],
    },
  ]
}

module.exports = sidebars
