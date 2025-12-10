import { Project } from './types';

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
