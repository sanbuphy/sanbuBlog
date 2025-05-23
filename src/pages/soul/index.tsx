import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

const TITLE = translate({
  id: 'theme.soul.title',
  message: 'Spark of the soul',
});

const DESCRIPTION = translate({
  id: 'theme.soul.description',
  message: '此处用于摘抄文字。',
});

// Soul content items
const soulItems = [
  {
    title: '第一性原理 @Elon Musk',
    content: `也许你听我说过，要从物理学的角度思考问题，这是第一性原理。即不要进行类比推理。你把事情细分到你可以想象的最基本元素，然后你从那里开始推理，这是确定某件事是否有意义的好方法。

特斯拉研制电动汽车期间，曾遇到一个难题：电池成本居高不下。当时储能电池的市场价格是每千瓦时600美元，这个市场价格很稳定，短期内不会有太大的变动。

但是马斯克从第一性原理角度进行思考：电池组到底是由什么材料组成的？这些电池原料的市场价格是多少？如果我们购买这些原材料然后组合成电池，需要多少钱？这个答案是，每千瓦时只需要80美元。

从最本质出发，研究电池都是由什么材料组成，再推算这些原材料加在一起的价格，从而得到电池的最低价格

1.第一性原理是演绎思维

2.第一性原理和追本溯源的区别在于出发点不同，一个从原理出发，一个从问题出发

3.相比追本溯源，第一性原理能够有更广阔的思路，能够创造性解决问题

4.第一性原理有其局限，因为它有其覆盖边界；要解决这个问题，就需要丰富原理库，进行多元思考`
  },


  {
    title: '吕蒙正《破窑赋》',
    content: `
> 天有不测风云，人有旦夕祸福。蜈蚣百足，行不及蛇；雄鸡两翼，飞不过鸦。马有千里之程，无骑不能自往；人有冲天之志，非运不能自通。  \n
盖闻：人生在世，富贵不能淫，贫贱不能移。文章盖世，孔子厄于陈邦；武略超群，太公钓于渭水。颜渊命短，殊非凶恶之徒；盗跖年长，岂是善良之辈。尧帝明圣，却生不肖之儿；瞽叟愚顽，反生大孝之子。张良原是布衣，萧何曾为县吏。晏子身无五尺，封作齐国宰相；孔明卧居草庐，能作蜀汉军师。楚霸虽雄，败于乌江自刎；汉王虽弱，竟有万里江山。李广有射虎之威，到老无封；冯唐有乘龙之才，一生不遇。韩信未遇之时，无一日三餐，及至遇行，腰悬三尺玉印，一旦时衰，死于阴人之手。\n
蜈蚣多足，不及蛇灵。雄鸡有翼，飞不及鸦。马有千里之驰，非人不能自往。人有千般巧计，无运不能自达。`
  },

  {
    title: '提问的艺术',
    content: `@Yangyixxxx  \n

最好的方式是找到成功的人请教
在找他们之前 你需要先识别出Top10
然后把这Top10的公开内容（采访稿件，访谈节目，视频..）通通都看一遍
以便能提出深刻的问题

带着这些问题，去请他们帮忙

不必担心别人不帮助你
但也不要太不把别人的时间当钱
所有的事情都是在不断交换价值
如果你什么都没有
那就想办法创造`
  },
  {
    title: '主动积累，无限进步',  
    content: `（不明转载出处） 
> 于小事做起：注重过往经历质量。核心项目与参与情况。\n
  于大事做起：学习系统建立各行各业的分析框架。行业业务的项目逻辑，后台的相互协助。需要哪些技能，有什么产品。工作流程。专业硬知识，行业分析，竞职风险。把所有的事情做过一遍。 \n
  于人做起：需要行业内人(靠谱前辈)的推荐，背书，邀请函。有效社交，识人。`
  }
];

function SoulHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>{TITLE}</h1>
      <div className={styles.separator} />
      <p>{DESCRIPTION}</p>
    </header>
  );
}

function TableOfContents() {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    const headingElements = document.querySelectorAll('.soul-heading');
    headingElements.forEach((element) => observer.observe(element));

    return () => {
      headingElements.forEach((element) => observer.unobserve(element));
    };
  }, []);

  return (
    <nav className={styles.tocSidebar}>
      <div className={styles.tocTitle}>目录</div>
      <ul className={styles.tocList}>
        {soulItems.map((item, index) => {
          const id = `soul-heading-${index}`;
          return (
            <li key={index} className={styles.tocItem}>
              <a
                href={`#${id}`}
                className={clsx(
                  styles.tocLink,
                  activeId === id && styles.tocLinkActive
                )}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SoulContent() {
  return (
    <div className={styles.pageContent}>
      <div className={styles.mainContent}>
        <div className={styles.container}>
          {soulItems.map((item, index) => (
            <article key={index} className={styles.soulItem}>
              <h2 
                id={`soul-heading-${index}`} 
                className={clsx(styles.soulItemTitle, 'soul-heading')}
              >
                {item.title}
              </h2>
              <div 
                className={styles.soulItemContent}
                dangerouslySetInnerHTML={{ 
                  __html: item.content
                    .split('\n\n')
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('')
                    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
                }} 
              />
            </article>
          ))}
        </div>
      </div>
      <TableOfContents />
    </div>
  );
}

function Soul(): JSX.Element {
  return (
    <Layout 
      title={TITLE} 
      description={DESCRIPTION}
      wrapperClassName="blog-list-page"
    >
      <main>
        <SoulHeader />
        <SoulContent />
      </main>
    </Layout>
  );
}

export default Soul; 