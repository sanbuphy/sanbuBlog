/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  skill: [
    // 这里应该是存放各种索引关联关系,也可以自动生成
    'skill/introduction',
    {
      label: 'c++相关',
      type: 'category',
      link: {
        type: 'generated-index',
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
      label: '日常开发',
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
    {//开发
      label: '操作系统',
      type: 'category',
      link: {
        type: 'generated-index',
      },  
      items: [
        {
          type:'autogenerated',
          dirName:'skill/os',
        }
      ],
    },
  ],
  ai: [
    'ai/introduction',
    {//多个类别
      label: 'Framework',
      type: 'category',
      link: {
        type: 'generated-index',
      },
      items: [
        {
          type:'autogenerated',
          dirName:'ai/framework',
        }
      ],
    },
    {
      label: 'Mlsys',
      type: 'category',
      link: {
        type: 'generated-index',
      },  
      items: [
        {
          type:'autogenerated',
          dirName:'ai/mlsys',
        }
      ],
    },
    {
      label: 'NVIDIA',
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
    {
      label: 'Lab',
      type: 'category',
      link: {
        type: 'generated-index',
      },
      items: [
        {
          type:'autogenerated',
          dirName:'ai/lab',
        }
      ],
    },
    {
      label: 'Notes',
      type: 'category',
      link: {
        type: 'generated-index',
      },
      items: [
        {
          type:'autogenerated',
          dirName:'ai/notes',
        }
      ],
    },
    {
      label: 'Others',
      type: 'category',
      link: {
        type: 'doc',
        id: 'ai/other/introduction'
      },    
      items: [
        {
          type:'autogenerated',
          dirName:'ai/other',
        }
      ],
    },
  ]
}

module.exports = sidebars
