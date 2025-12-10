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
      title: '年轻女性 + 宠物',
      imageContent: 'https://picsum.photos/id/237/300/200',
      textContent: '目标人群：年轻女性\n元素：可爱宠物\n情绪：治愈、温馨'
    },
    {
      id: 'hook-2',
      cardType: 'hook',
      title: '职场精英 + 效率',
      imageContent: 'https://picsum.photos/id/180/300/200',
      textContent: '目标人群：职场人士\n元素：办公场景\n情绪：高效、专业'
    },
    {
      id: 'hook-3',
      cardType: 'hook',
      title: '家庭生活 + 温馨',
      imageContent: 'https://picsum.photos/id/1074/300/200',
      textContent: '目标人群：家庭用户\n元素：居家场景\n情绪：温暖、舒适'
    }
  ],
  inspiration: [
    {
      id: 'insp-1',
      cardType: 'inspiration',
      title: '小红书热门话题',
      imageContent: 'https://picsum.photos/id/48/300/200',
      textContent: '话题：#秋日穿搭\n热度：100w+\n适用场景：服饰、美妆'
    },
    {
      id: 'insp-2',
      cardType: 'inspiration',
      title: '抖音爆款格式',
      imageContent: 'https://picsum.photos/id/367/300/200',
      textContent: '格式：前后对比\n数据：平均播放500w+\n适用：改造类、教程类'
    },
    {
      id: 'insp-3',
      cardType: 'inspiration',
      title: '竞品案例分析',
      imageContent: 'https://picsum.photos/id/430/300/200',
      textContent: '品牌：某美妆品牌\n数据：转化率3.5%\n可借鉴点：视觉风格、文案节奏'
    }
  ],
  template: [
    {
      id: 'temp-1',
      cardType: 'template',
      title: 'Betty IP 模板',
      imageContent: 'https://picsum.photos/id/64/300/200',
      textContent: '风格：可爱、亲和\n配色：粉色系\n出量数据：日均10w+'
    },
    {
      id: 'temp-2',
      cardType: 'template',
      title: '图文卡片模板',
      imageContent: 'https://picsum.photos/id/brown/300/200',
      textContent: '布局：上图下文\n比例：16:9\n适用：知识类、产品介绍'
    },
    {
      id: 'temp-3',
      cardType: 'template',
      title: '视频封面模板',
      imageContent: 'https://picsum.photos/id/152/300/200',
      textContent: '元素：大标题+关键信息\n色彩：高对比度\n点击率：提升40%'
    }
  ],
  product: [
    {
      id: 'prod-1',
      cardType: 'product',
      title: '产品主图',
      imageContent: 'https://picsum.photos/id/160/300/200',
      textContent: '产品：智能手表\n角度：45度斜视\n背景：纯白'
    },
    {
      id: 'prod-2',
      cardType: 'product',
      title: '使用场景图',
      imageContent: 'https://picsum.photos/id/201/300/200',
      textContent: '场景：户外运动\n模特：年轻女性\n光线：自然光'
    },
    {
      id: 'prod-3',
      cardType: 'product',
      title: '细节特写',
      imageContent: 'https://picsum.photos/id/250/300/200',
      textContent: '重点：材质纹理\n拍摄：微距\n用途：展示品质'
    }
  ],
  constraint: [
    {
      id: 'cons-1',
      cardType: 'constraint',
      title: '比例约束 16:9',
      imageContent: 'https://picsum.photos/id/gray/300/200',
      textContent: '平台：抖音、B站\n原因：横屏主流\n注意：留白安全区'
    },
    {
      id: 'cons-2',
      cardType: 'constraint',
      title: '风格约束：小清新',
      imageContent: 'https://picsum.photos/id/1015/300/200',
      textContent: '色调：明亮、柔和\n禁止：暗黑、重金属\n品牌调性要求'
    },
    {
      id: 'cons-3',
      cardType: 'constraint',
      title: '时长约束 15-30秒',
      imageContent: 'https://picsum.photos/id/1025/300/200',
      textContent: '平台：短视频\n原因：完播率优化\n建议：黄金3秒开头'
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
