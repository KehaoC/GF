import { Project, CardType } from './types';

// Card Library Template
export interface CardTemplate {
  id: string;
  cardType: CardType;
  title: string;
  imageContent: string;
  textContent: string;
}

// Card Library - organized by card type
export const CARD_LIBRARY: Record<CardType, CardTemplate[]> = {
  hook: [
    {
      id: 'hook-1',
      cardType: 'hook',
      title: '智商羞辱',
      imageContent: 'https://picsum.photos/id/180/300/200',
      textContent: '心理动机：证明自己更聪明\n受众：喜欢挑战的用户\n文案方向："只有2%的人能在30秒内解开"\n转化率：高'
    },
    {
      id: 'hook-2',
      cardType: 'hook',
      title: '好奇心驱动',
      imageContent: 'https://picsum.photos/id/1015/300/200',
      textContent: '心理动机：想知道答案\n受众：求知欲强的用户\n文案方向："你能找出这张图的秘密吗？"\n适用：Cryptogram、Find Difference'
    },
    {
      id: 'hook-3',
      cardType: 'hook',
      title: '成就感获取',
      imageContent: 'https://picsum.photos/id/367/300/200',
      textContent: '心理动机：完成任务的满足感\n受众：目标导向型用户\n文案方向："每天10分钟，挑战你的大脑"\n留存：高'
    },
    {
      id: 'hook-4',
      cardType: 'hook',
      title: '社交炫耀',
      imageContent: 'https://picsum.photos/id/64/300/200',
      textContent: '心理动机：向朋友展示智商\n受众：社交活跃用户\n文案方向："我通关了Expert关卡，你敢来吗？"\n分享率：高'
    },
    {
      id: 'hook-5',
      cardType: 'hook',
      title: '焦虑缓解',
      imageContent: 'https://picsum.photos/id/1074/300/200',
      textContent: '心理动机：通过专注游戏放松\n受众：压力大的上班族\n文案方向："3分钟解压，不需要思考"\n使用场景：碎片时间'
    }
  ],
  inspiration: [
    {
      id: 'insp-1',
      cardType: 'inspiration',
      title: '圣诞节热点',
      imageContent: 'https://picsum.photos/id/145/300/200',
      textContent: '节日：Christmas 2024\n热度：超高\n创意方向：圣诞老人找礼物、雪景找不同\n素材元素：圣诞树、雪花、礼物盒'
    },
    {
      id: 'insp-2',
      cardType: 'inspiration',
      title: '新年挑战',
      imageContent: 'https://picsum.photos/id/395/300/200',
      textContent: '节日：New Year 2025\n热度：高\n创意方向："新年第一题，测测你的IQ"\n素材元素：烟花、红包、福字'
    },
    {
      id: 'insp-3',
      cardType: 'inspiration',
      title: '情人节浪漫',
      imageContent: 'https://picsum.photos/id/225/300/200',
      textContent: '节日：Valentine\'s Day\n热度：中高\n创意方向：情侣找不同、浪漫密码\n素材元素：玫瑰、爱心、巧克力'
    },
    {
      id: 'insp-4',
      cardType: 'inspiration',
      title: '复仇者联盟热映',
      imageContent: 'https://picsum.photos/id/237/300/200',
      textContent: '热点：电影上映\n热度：爆炸\n创意方向：超级英雄找不同\n版权：需注意，使用同类元素'
    },
    {
      id: 'insp-5',
      cardType: 'inspiration',
      title: '世界杯期间',
      imageContent: 'https://picsum.photos/id/431/300/200',
      textContent: '热点：World Cup\n热度：极高\n创意方向：足球场景找不同、球星密码\n受众：体育爱好者'
    }
  ],
  template: [
    {
      id: 'temp-1',
      cardType: 'template',
      title: '验证有效模板 A',
      imageContent: '/images/template1.jpg',
      textContent: 'ROI：3.2\nCTR：8.5%\nCVR：12.3%\n日消耗：$5000\n验证时间：2024-11'
    },
  ],
  product: [
    {
      id: 'prod-1',
      cardType: 'product',
      title: 'Cryptogram 主界面',
      imageContent: '/images/product1.png',
      textContent: '产品：Cryptogram Expert Level 5\n展示：谜题界面 + 键盘\n用途：展示核心玩法'
    },
    {
      id: 'prod-2',
      cardType: 'product',
      title: 'Find Difference 关卡',
      imageContent: 'https://picsum.photos/id/1025/300/200',
      textContent: '产品：Find Difference Level 12\n场景：卧室找不同\n难度：中等\n用途：展示画面精美度'
    },
    {
      id: 'prod-3',
      cardType: 'product',
      title: '成就系统截图',
      imageContent: 'https://picsum.photos/id/367/300/200',
      textContent: '产品：Achievement Page\n展示：奖杯、徽章、排行榜\n用途：激励用户完成挑战'
    },
    {
      id: 'prod-4',
      cardType: 'product',
      title: '每日挑战界面',
      imageContent: 'https://picsum.photos/id/395/300/200',
      textContent: '产品：Daily Challenge\n展示：限时任务 + 奖励\n用途：展示持续可玩性'
    }
  ],
  constraint: [
    {
      id: 'cons-1',
      cardType: 'constraint',
      title: '平台约束 - Facebook',
      imageContent: 'https://picsum.photos/id/430/300/200',
      textContent: '比例：1:1 或 4:5\n时长：≤15秒\n文字：避免"免费""最好"\n审核：严格，避免智商歧视'
    },
    {
      id: 'cons-2',
      cardType: 'constraint',
      title: '平台约束 - TikTok',
      imageContent: 'https://picsum.photos/id/48/300/200',
      textContent: '比例：9:16 竖屏\n时长：9-15秒最佳\n节奏：前3秒必须抓眼球\n音乐：使用平台热门BGM'
    },
    {
      id: 'cons-3',
      cardType: 'constraint',
      title: '品牌调性约束',
      imageContent: 'https://picsum.photos/id/152/300/200',
      textContent: '风格：轻松、友好、不说教\n禁止：过度智商羞辱\n色调：明亮、温暖\n目标：让用户觉得"我也能行"'
    },
    {
      id: 'cons-4',
      cardType: 'constraint',
      title: '受众年龄约束',
      imageContent: 'https://picsum.photos/id/250/300/200',
      textContent: '主要受众：25-55岁\n避免：过于年轻化的梗\n语言：简洁、通俗\n场景：日常生活相关'
    },
    {
      id: 'cons-5',
      cardType: 'constraint',
      title: 'ROI 目标约束',
      imageContent: 'https://picsum.photos/id/160/300/200',
      textContent: '目标ROI：≥2.0\nCPI上限：$1.2\nD7留存：≥15%\n需在此约束下优化素材'
    }
  ]
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Cozy Fall Living Room Party',
    updatedAt: 'Sep 18 2025',
    thumbnail: 'https://picsum.photos/id/10/400/300',
    isExample: true,
    elements: [
      { id: 'e1', type: 'image', x: 100, y: 100, width: 300, height: 200, content: 'https://picsum.photos/id/10/600/400' },
      { id: 'e2', type: 'text', x: 450, y: 150, width: 200, height: 100, content: 'Autumn Vibes ✨' },
    ]
  },
  {
    id: '2',
    title: 'Memphis Dinnerware Inspiration',
    updatedAt: 'Sep 23 2025',
    thumbnail: 'https://picsum.photos/id/20/400/300',
    isExample: true,
    elements: [
        { id: 'e3', type: 'image', x: 0, y: 0, width: 400, height: 400, content: 'https://picsum.photos/id/123/400/400' }
    ]
  },
  {
    id: '3',
    title: 'Birds with Googly Eyes',
    updatedAt: 'Aug 23 2025',
    thumbnail: 'https://picsum.photos/id/30/400/300',
    isExample: true,
    elements: []
  },
  {
    id: '4',
    title: 'Untitled',
    updatedAt: 'Today',
    thumbnail: '', 
    elements: []
  }
];

export const INITIAL_VIEWPORT = { x: 0, y: 0, scale: 1 };
