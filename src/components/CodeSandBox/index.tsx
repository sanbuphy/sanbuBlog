import React from 'react'
import { useColorMode } from '@docusaurus/theme-common'

// 定义一个组件，接收 slug、title 和 height 属性，默认高度为 600px
function Index({ slug, title, height = '600px' }) {
  // 获取当前主题模式
  const { isDarkTheme } = useColorMode()
  // 根据主题模式构建代码沙箱的源地址
  const themedSrc = `https://codesandbox.io/embed/${slug}?fontsize=14&hidenavigation=1&view=preview&theme=${
    isDarkTheme ? 'dark' : 'light'
  }`
  
  return (
    <div>
      <iframe
        src={themedSrc} // 设置 iframe 的源地址
        style={{
          width: '100%', // 宽度为 100%
          height, // 高度为传入的 height 属性
          border: 0, // 无边框
          borderRadius: '4px', // 圆角边框
          overflow: 'none', // 隐藏溢出内容
        }}
        title={title} // 设置 iframe 的标题
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" // 允许的功能
        sandbox="allow-forms allow-modals allow-pops allow-presentation allow-same-origin allow-scripts" // 设置沙箱属性
      ></iframe>
    </div>
  )
}

export default Index // 导出组件
