import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { CanvasItem } from '../components/CanvasItem';
import { CardSelector } from '../components/CardSelector';
import { TaskPanel, GenerationTask, TaskStatus } from '../components/TaskPanel';
import { CanvasElement, Tool, Viewport } from '../types';
import { INITIAL_VIEWPORT, CardTemplate, CARD_LIBRARY } from '../constants';
import { generateImageFromPrompt } from '../services/geminiService';
import { projectsAPI } from '../services/api';

type AIMode = 'generate' | 'inspire';

interface ModeConfig {
  label: string;
  icon: string;
  placeholder: string;
  color: string;
  borderColor: string;
  bgColor: string;
  buttonBg: string;
  buttonHover: string;
  description: string;
}

const MODE_CONFIGS: Record<AIMode, ModeConfig> = {
  generate: {
    label: '生图模式',
    icon: 'Sparkles',
    placeholder: '描述你想要生成的图片...',
    color: 'text-[#8576C7]',
    borderColor: 'border-[#EADDFF]',
    bgColor: 'bg-white',
    buttonBg: 'bg-[#EADDFF]',
    buttonHover: 'hover:bg-[#E0CFFF]',
    description: '使用 AI 生成全新图片'
  },
  inspire: {
    label: 'Inspire 模式',
    icon: 'Lightbulb',
    placeholder: '描述你想要的创意灵感...',
    color: 'text-[#F59E0B]',
    borderColor: 'border-[#FEF3C7]',
    bgColor: 'bg-amber-50',
    buttonBg: 'bg-[#FEF3C7]',
    buttonHover: 'hover:bg-[#FDE68A]',
    description: '获取创意灵感和建议'
  }
};

const Editor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [isCardSelectorOpen, setIsCardSelectorOpen] = useState(false);
  const [resizingElement, setResizingElement] = useState<{ id: string; handle: string; startX: number; startY: number; startWidth: number; startHeight: number; startElementX: number; startElementY: number } | null>(null);
  const [customCards, setCustomCards] = useState<CardTemplate[]>([]);
  const [aiMode, setAiMode] = useState<AIMode>('generate');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // 任务队列状态
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [isTaskPanelExpanded, setIsTaskPanelExpanded] = useState(false);
  const isProcessingRef = useRef(false);

  // 新增：项目加载和保存状态
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [projectTitle, setProjectTitle] = useState('Untitled');

  // 标题编辑状态
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize - Load project from backend
  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      setIsLoadingProject(true);
      try {
        const project = await projectsAPI.get(id);
        setElements(project.elements || []);
        setProjectTitle(project.title);
        setSaveStatus('saved');
      } catch (error: any) {
        console.error('Failed to load project:', error);
        alert(error.message || '项目加载失败');
        navigate('/');
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  // Keyboard Event Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected elements (Delete or Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent deletion if user is typing in an input field
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        if (selectedIds.size > 0) {
          e.preventDefault();
          setElements(prev => prev.filter(el => !selectedIds.has(el.id)));
          setSelectedIds(new Set());
        }
      }

      // Zoom in (Ctrl/Cmd + Plus or Equal)
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        setViewport(prev => ({ ...prev, scale: Math.min(5, prev.scale + 0.1) }));
      }

      // Zoom out (Ctrl/Cmd + Minus)
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setViewport(prev => ({ ...prev, scale: Math.max(0.1, prev.scale - 0.1) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  // Auto-save: Debounce 2 秒后自动保存
  useEffect(() => {
    // 跳过初始加载和空项目
    if (isLoadingProject || !id) return;

    // 标记为未保存
    setSaveStatus('unsaved');

    // 设置 2 秒延迟保存
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await projectsAPI.update(id, { elements });
        setSaveStatus('saved');
      } catch (error: any) {
        console.error('Auto-save failed:', error);
        setSaveStatus('unsaved');
      }
    }, 2000);

    // 清理定时器
    return () => clearTimeout(timer);
  }, [elements, id, isLoadingProject]);

  // 更新任务状态的辅助函数
  const updateTask = useCallback((taskId: string, updates: Partial<GenerationTask>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  // 处理任务队列
  const processNextTask = useCallback(async () => {
    if (isProcessingRef.current) return;

    const pendingTask = tasks.find(t => t.status === 'pending');
    if (!pendingTask) return;

    isProcessingRef.current = true;

    // 更新任务状态为运行中
    updateTask(pendingTask.id, { status: 'running', progress: 10 });

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setTasks(prev => {
          const task = prev.find(t => t.id === pendingTask.id);
          if (task && task.status === 'running' && task.progress < 90) {
            return prev.map(t =>
              t.id === pendingTask.id
                ? { ...t, progress: Math.min(90, t.progress + Math.random() * 15) }
                : t
            );
          }
          return prev;
        });
      }, 500);

      // 获取选中的元素作为上下文
      const contextElements = elements.filter(el => selectedIds.has(el.id));
      const newImageUrl = await generateImageFromPrompt(pendingTask.prompt, contextElements);

      clearInterval(progressInterval);

      // 计算新元素位置
      let startX = 0, startY = 0;
      if (contextElements.length > 0) {
        startX = contextElements[0].x + contextElements[0].width + 20;
        startY = contextElements[0].y;
      } else {
        const center = screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
        startX = center.x;
        startY = center.y;
      }

      // 创建新元素
      const newEl: CanvasElement = {
        id: `ai-${Date.now()}`,
        type: 'image',
        x: startX,
        y: startY,
        width: 400,
        height: 400,
        content: newImageUrl
      };

      setElements(prev => [...prev, newEl]);

      // 更新任务为完成
      updateTask(pendingTask.id, {
        status: 'completed',
        progress: 100,
        resultImageUrl: newImageUrl
      });

    } catch (error) {
      console.error('Task failed:', error);
      updateTask(pendingTask.id, {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : '生成失败'
      });
    } finally {
      isProcessingRef.current = false;
    }
  }, [tasks, elements, selectedIds, updateTask]);

  // 监听任务队列变化，自动处理下一个任务
  useEffect(() => {
    const hasPendingTasks = tasks.some(t => t.status === 'pending');
    const hasRunningTasks = tasks.some(t => t.status === 'running');

    if (hasPendingTasks && !hasRunningTasks) {
      processNextTask();
    }

    // 当有新任务时自动展开面板
    if (tasks.length > 0 && tasks.some(t => t.status === 'pending' || t.status === 'running')) {
      setIsTaskPanelExpanded(true);
    }
  }, [tasks, processNextTask]);

  // 添加任务到队列
  const addTaskToQueue = useCallback((prompt: string) => {
    const newTask: GenerationTask = {
      id: `task-${Date.now()}`,
      prompt,
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
    setIsTaskPanelExpanded(true);
  }, []);

  // 清除已完成的任务
  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(t => t.status !== 'completed' && t.status !== 'failed'));
  }, []);

  // 点击任务时选中对应的生成结果
  const handleTaskClick = useCallback((task: GenerationTask) => {
    if (task.status === 'completed' && task.resultImageUrl) {
      // 找到对应的元素并选中
      const element = elements.find(el => el.content === task.resultImageUrl);
      if (element) {
        setSelectedIds(new Set([element.id]));
        // 将视口移动到元素位置
        setViewport(prev => ({
          ...prev,
          x: window.innerWidth / 2 - element.x * prev.scale - element.width * prev.scale / 2,
          y: window.innerHeight / 2 - element.y * prev.scale - element.height * prev.scale / 2,
        }));
      }
    }
  }, [elements]);

  // 开始编辑标题
  const handleStartEditTitle = useCallback(() => {
    setEditingTitle(projectTitle);
    setIsEditingTitle(true);
    // 延迟聚焦，等待 input 渲染
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  }, [projectTitle]);

  // 保存标题
  const handleSaveTitle = useCallback(async () => {
    const newTitle = editingTitle.trim();
    if (!newTitle || newTitle === projectTitle) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await projectsAPI.update(id!, { title: newTitle });
      setProjectTitle(newTitle);
    } catch (error) {
      console.error('Failed to update title:', error);
    }
    setIsEditingTitle(false);
  }, [editingTitle, projectTitle, id]);

  // 取消编辑标题
  const handleCancelEditTitle = useCallback(() => {
    setIsEditingTitle(false);
    setEditingTitle('');
  }, []);

  // 处理标题输入框的键盘事件
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEditTitle();
    }
  }, [handleSaveTitle, handleCancelEditTitle]);

  // Coordinate Conversion
  const screenToCanvas = (screenX: number, screenY: number) => {
    return {
      x: (screenX - viewport.x) / viewport.scale,
      y: (screenY - viewport.y) / viewport.scale
    };
  };

  // Input Handling
  const handlePointerDown = (e: React.PointerEvent) => {
    // Middle mouse or Spacebar (handled via keydown usually) or Hand tool
    if (e.button === 1 || activeTool === 'hand') {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

    // Start selection rectangle if clicking empty space in select mode
    if (activeTool === 'select' && e.target === canvasRef.current) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setIsSelecting(true);
      setSelectionRect({
        startX: canvasPos.x,
        startY: canvasPos.y,
        endX: canvasPos.x,
        endY: canvasPos.y
      });
      setSelectedIds(new Set());
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    setLastMousePos({ x: e.clientX, y: e.clientY });

    if (isPanning) {
      setViewport(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      return;
    }

    // Update selection rectangle while selecting
    if (isSelecting && selectionRect) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setSelectionRect(prev => prev ? {
        ...prev,
        endX: canvasPos.x,
        endY: canvasPos.y
      } : null);
      return;
    }

    // Handle resizing
    if (resizingElement) {
      const { id, handle, startX, startY, startWidth, startHeight, startElementX, startElementY } = resizingElement;
      const totalDeltaX = (e.clientX - startX) / viewport.scale;
      const totalDeltaY = (e.clientY - startY) / viewport.scale;

      setElements(prev => prev.map(el => {
        if (el.id === id) {
          let newX = startElementX;
          let newY = startElementY;
          let newWidth = startWidth;
          let newHeight = startHeight;

          // Handle different resize directions
          if (handle.includes('n')) {
            newY = startElementY + totalDeltaY;
            newHeight = startHeight - totalDeltaY;
          }
          if (handle.includes('s')) {
            newHeight = startHeight + totalDeltaY;
          }
          if (handle.includes('w')) {
            newX = startElementX + totalDeltaX;
            newWidth = startWidth - totalDeltaX;
          }
          if (handle.includes('e')) {
            newWidth = startWidth + totalDeltaX;
          }

          // Enforce minimum size
          const minSize = 50;
          if (newWidth < minSize) {
            if (handle.includes('w')) {
              newX = startElementX + startWidth - minSize;
            }
            newWidth = minSize;
          }
          if (newHeight < minSize) {
            if (handle.includes('n')) {
              newY = startElementY + startHeight - minSize;
            }
            newHeight = minSize;
          }

          return {
            ...el,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          };
        }
        return el;
      }));
      return;
    }

    if (draggedElementId && activeTool === 'select') {
      setElements(prev => prev.map(el => {
        if (el.id === draggedElementId) {
          return {
            ...el,
            x: el.x + deltaX / viewport.scale,
            y: el.y + deltaY / viewport.scale
          };
        }
        return el;
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Finalize selection rectangle
    if (isSelecting && selectionRect) {
      const { startX, startY, endX, endY } = selectionRect;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      // Select all elements that intersect with the selection rectangle
      const selectedElements = elements.filter(el => {
        const elRight = el.x + el.width;
        const elBottom = el.y + el.height;

        // Check if element intersects with selection rectangle
        return !(el.x > maxX || elRight < minX || el.y > maxY || elBottom < minY);
      });

      setSelectedIds(new Set(selectedElements.map(el => el.id)));
      setIsSelecting(false);
      setSelectionRect(null);
    }

    setIsPanning(false);
    setDraggedElementId(null);
    setResizingElement(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const newScale = Math.min(Math.max(0.1, viewport.scale - e.deltaY * zoomSensitivity), 5);
      
      // Zoom towards mouse pointer logic could go here, simplified for now to center/origin
      setViewport(prev => ({ ...prev, scale: newScale }));
    } else {
      setViewport(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    if (activeTool === 'hand') return;
    e.stopPropagation();

    // Select
    if (!e.shiftKey) {
        setSelectedIds(new Set([id]));
    } else {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    // Start Drag
    if (activeTool === 'select') {
        setDraggedElementId(id);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === id);
    if (!element) return;

    setResizingElement({
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      startElementX: element.x,
      startElementY: element.y
    });
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleAddText = () => {
    const center = screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
    const newEl: CanvasElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        x: center.x - 100,
        y: center.y - 50,
        width: 200,
        height: 100,
        content: 'New Text'
    };
    setElements(prev => [...prev, newEl]);
    setSelectedIds(new Set([newEl.id]));
    setActiveTool('select');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const center = screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
            const newEl: CanvasElement = {
                id: `img-${Date.now()}`,
                type: 'image',
                x: center.x - 150,
                y: center.y - 150,
                width: 300,
                height: 300,
                content: ev.target?.result as string
            };
            setElements(prev => [...prev, newEl]);
            setSelectedIds(new Set([newEl.id]));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleCardSelect = (cardTemplate: CardTemplate) => {
    const center = screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
    const newCard: CanvasElement = {
        id: `card-${Date.now()}`,
        type: 'card',
        cardType: cardTemplate.cardType,
        x: center.x - 150,
        y: center.y - 200,
        width: 300,
        height: 400,
        content: '',
        imageContent: cardTemplate.imageContent,
        textContent: cardTemplate.textContent
    };
    setElements(prev => [...prev, newCard]);
    setSelectedIds(new Set([newCard.id]));
    setActiveTool('select');
  };

  const handleCreateCard = (newCard: CardTemplate) => {
    setCustomCards(prev => [...prev, newCard]);
  };

  const handleExport = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要导出的元素');
      return;
    }

    try {
      // Dynamic import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const selectedElements = elements.filter(el => selectedIds.has(el.id));
      let imageCount = 0;

      for (const element of selectedElements) {
        let imageUrl: string | undefined;

        // Extract image URL based on element type
        if (element.type === 'image') {
          imageUrl = element.content;
        } else if (element.type === 'card' && element.imageContent) {
          imageUrl = element.imageContent;
        }

        if (imageUrl) {
          imageCount++;
          try {
            // Fetch image and convert to blob
            if (imageUrl.startsWith('data:')) {
              // Data URL - convert directly
              const base64Data = imageUrl.split(',')[1];
              const mimeType = imageUrl.match(/data:([^;]+)/)?.[1] || 'image/png';
              const ext = mimeType.split('/')[1] || 'png';
              zip.file(`image_${imageCount}.${ext}`, base64Data, { base64: true });
            } else {
              // External URL - fetch and add
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const ext = blob.type.split('/')[1] || 'png';
              zip.file(`image_${imageCount}.${ext}`, blob);
            }
          } catch (error) {
            console.error(`Failed to add image ${imageCount}:`, error);
          }
        }
      }

      if (imageCount === 0) {
        alert('所选元素中没有图片');
        return;
      }

      // Generate zip file and download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    }
  };

  // AI Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (aiMode === 'inspire') {
        // Inspire Mode: Generate multiple Inspiration Cards (保持原有的同步逻辑)
        setIsGenerating(true);
        try {
            const inspirationCards = CARD_LIBRARY.inspiration;

            // Randomly select 3-5 cards
            const cardCount = Math.floor(Math.random() * 3) + 3; // 3-5 cards
            const selectedCards: CardTemplate[] = [];
            const availableCards = [...inspirationCards];

            for (let i = 0; i < Math.min(cardCount, availableCards.length); i++) {
                const randomIndex = Math.floor(Math.random() * availableCards.length);
                selectedCards.push(availableCards[randomIndex]);
                availableCards.splice(randomIndex, 1);
            }

            // Place cards on canvas in a grid layout
            const center = screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
            const cardWidth = 300;
            const cardHeight = 400;
            const gap = 20;
            const columns = Math.min(3, selectedCards.length);
            const rows = Math.ceil(selectedCards.length / columns);

            // Calculate starting position to center the grid
            const totalWidth = columns * cardWidth + (columns - 1) * gap;
            const totalHeight = rows * cardHeight + (rows - 1) * gap;
            let startX = center.x - totalWidth / 2;
            let startY = center.y - totalHeight / 2;

            const newCards: CanvasElement[] = selectedCards.map((card, index) => {
                const col = index % columns;
                const row = Math.floor(index / columns);
                const x = startX + col * (cardWidth + gap);
                const y = startY + row * (cardHeight + gap);

                return {
                    id: `inspire-${Date.now()}-${index}`,
                    type: 'card',
                    cardType: 'inspiration',
                    x,
                    y,
                    width: cardWidth,
                    height: cardHeight,
                    content: '',
                    imageContent: card.imageContent,
                    textContent: card.textContent
                };
            });

            setElements(prev => [...prev, ...newCards]);
            setSelectedIds(new Set(newCards.map(c => c.id)));
            setPrompt('');
        } catch (error) {
            console.error("Generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    } else {
        // Generate Mode: 使用任务队列，支持批量生图
        addTaskToQueue(prompt);
        setPrompt('');
    }
  };

  // Loading state
  if (isLoadingProject) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8576C7]/30 border-t-[#8576C7] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">加载项目中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F9FAFB] flex flex-col relative text-slate-800">
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-20 flex justify-between items-center px-4 z-40 pointer-events-none">
            {/* Left Section */}
            <div className="flex items-center gap-3 pointer-events-auto mt-2">
                <button 
                    onClick={() => navigate('/')} 
                    className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
                >
                    <Icon name="ArrowLeft" size={24} className="text-gray-700" />
                </button>
                
                {/* Project Title Pill */}
                <div className="flex items-center h-10 bg-[#F0F4F9] rounded-full px-4 border border-transparent hover:border-gray-300 transition-colors">
                   {isEditingTitle ? (
                     <input
                       ref={titleInputRef}
                       type="text"
                       value={editingTitle}
                       onChange={(e) => setEditingTitle(e.target.value)}
                       onKeyDown={handleTitleKeyDown}
                       onBlur={handleSaveTitle}
                       className="text-[15px] font-medium text-gray-700 bg-transparent outline-none border-none w-40"
                       placeholder="项目名称"
                     />
                   ) : (
                     <span
                       className="text-[15px] font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                       onClick={handleStartEditTitle}
                       title="点击重命名"
                     >
                       {projectTitle}
                     </span>
                   )}
                   <div className="w-px h-4 bg-gray-300 mx-3" />
                   <Icon
                     name={isEditingTitle ? "Check" : "Pencil"}
                     size={14}
                     className={`cursor-pointer transition-colors ${isEditingTitle ? 'text-green-500 hover:text-green-700' : 'text-gray-500 hover:text-gray-800'}`}
                     onClick={isEditingTitle ? handleSaveTitle : handleStartEditTitle}
                   />
                </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-3 pointer-events-auto mt-2">
                 {/* Save Status Indicator */}
                 <div className="flex items-center gap-2 px-4 h-10 bg-[#F0F4F9] rounded-full">
                   {saveStatus === 'saved' && (
                     <>
                       <Icon name="Check" size={16} className="text-green-600" />
                       <span className="text-[13px] font-medium text-green-700">已保存</span>
                     </>
                   )}
                   {saveStatus === 'saving' && (
                     <>
                       <div className="w-4 h-4 border-2 border-[#8576C7]/30 border-t-[#8576C7] rounded-full animate-spin" />
                       <span className="text-[13px] font-medium text-gray-600">保存中...</span>
                     </>
                   )}
                   {saveStatus === 'unsaved' && (
                     <>
                       <Icon name="Clock" size={16} className="text-orange-500" />
                       <span className="text-[13px] font-medium text-orange-600">未保存</span>
                     </>
                   )}
                 </div>

                 <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-5 h-10 text-[14px] font-medium text-gray-800 bg-[#F0F4F9] hover:bg-gray-200 rounded-full transition-colors"
                 >
                    <Icon name="Download" size={18} />
                    导出
                 </button>
                 <button
                    onClick={() => setShowHelpModal(true)}
                    className="flex items-center gap-2 px-5 h-10 text-[14px] font-medium text-white bg-[#8576C7] hover:bg-[#7463B8] rounded-full shadow-sm transition-colors"
                 >
                    <Icon name="HelpCircle" size={16} />
                    Help
                 </button>
            </div>
        </div>

        {/* Left Toolbar */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col p-2 gap-2 z-40">
             <button 
                onClick={() => setActiveTool('select')}
                className={`p-3 rounded-xl transition-all ${activeTool === 'select' ? 'bg-[#F4F2FA] text-[#6A5A9E]' : 'hover:bg-gray-50 text-gray-500'}`}
                title="Select"
             >
                <Icon name="MousePointer2" size={20} className={activeTool === 'select' ? "fill-current" : ""} />
             </button>
             <button 
                onClick={() => setActiveTool('hand')}
                className={`p-3 rounded-xl transition-all ${activeTool === 'hand' ? 'bg-[#F4F2FA] text-[#6A5A9E]' : 'hover:bg-gray-50 text-gray-500'}`}
                title="Pan"
             >
                <Icon name="Hand" size={20} />
             </button>
             <button 
                onClick={handleAddText}
                className={`p-3 rounded-xl transition-all hover:bg-gray-50 text-gray-500`}
                title="Add Text"
             >
                <Icon name="Type" size={20} />
             </button>
             
             <div className="h-px bg-gray-100 w-full mx-auto" />

             <button
                onClick={() => setIsCardSelectorOpen(true)}
                className="p-3 rounded-xl hover:bg-gray-50 text-gray-500 transition-all"
                title="Add Card"
             >
                <Icon name="LayoutGrid" size={20} />
             </button>
             <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl hover:bg-gray-50 text-gray-500 transition-all"
                title="Upload Image"
             >
                <Icon name="Image" size={20} />
             </button>
             <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
        </div>

        {/* Right Task Panel */}
        <TaskPanel
          tasks={tasks}
          isExpanded={isTaskPanelExpanded}
          onToggleExpand={() => setIsTaskPanelExpanded(prev => !prev)}
          onTaskClick={handleTaskClick}
          onClearCompleted={clearCompletedTasks}
        />

        {/* Canvas Area */}
        <div 
            className={`flex-1 overflow-hidden relative ${activeTool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
        >
            <div 
                className="absolute inset-0 dot-grid origin-top-left will-change-transform"
                style={{
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
                    width: '100%',
                    height: '100%',
                }}
            >
                 {elements.map(el => (
                    <CanvasItem
                        key={el.id}
                        element={el}
                        isSelected={selectedIds.has(el.id)}
                        onMouseDown={handleElementMouseDown}
                        onResizeStart={handleResizeStart}
                    />
                 ))}

                 {/* Selection Rectangle */}
                 {isSelecting && selectionRect && (
                    <div
                        className="absolute border-2 border-[#8576C7] bg-[#8576C7]/10 pointer-events-none"
                        style={{
                            left: Math.min(selectionRect.startX, selectionRect.endX),
                            top: Math.min(selectionRect.startY, selectionRect.endY),
                            width: Math.abs(selectionRect.endX - selectionRect.startX),
                            height: Math.abs(selectionRect.endY - selectionRect.startY),
                        }}
                    />
                 )}
            </div>

            {/* Loading Indicator */}
            {isGenerating && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full border-4 border-[#EADDFF] border-t-[#8576C7] animate-spin bg-white/50 backdrop-blur mb-4" />
                    <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow-lg text-[#6A5A9E] font-medium animate-pulse border border-[#EADDFF]">
                        Dreaming up ideas...
                    </div>
                 </div>
            )}
        </div>

        {/* Bottom Bar Layout */}
        <div className="absolute bottom-6 left-0 right-0 px-6 flex items-end justify-between pointer-events-none z-40">
            
            {/* Left: Info */}
            <div className="pointer-events-auto">
                <button className="w-11 h-11 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                    <Icon name="Info" size={20} />
                </button>
            </div>

            {/* Center: AI Input */}
            <div className="pointer-events-auto flex items-center gap-3 w-full max-w-[800px] mx-auto mb-1">
                 {/* Mode Menu Button */}
                <div className="relative">
                  <button
                      className="w-[52px] h-[52px] bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all shrink-0"
                      onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                  >
                      <Icon name="Menu" size={24} strokeWidth={1.5} />
                  </button>

                  {/* Mode Dropdown Menu */}
                  {isModeMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsModeMenuOpen(false)}
                      />
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                        {(Object.keys(MODE_CONFIGS) as AIMode[]).map((mode) => {
                          const config = MODE_CONFIGS[mode];
                          const isActive = aiMode === mode;
                          return (
                            <button
                              key={mode}
                              onClick={() => {
                                setAiMode(mode);
                                setIsModeMenuOpen(false);
                              }}
                              className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${
                                isActive
                                  ? `${config.bgColor} ${config.color}`
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full ${isActive ? config.buttonBg : 'bg-gray-100'} flex items-center justify-center shrink-0`}>
                                <Icon name={config.icon as any} size={20} className={isActive ? config.color : 'text-gray-600'} />
                              </div>
                              <div className="flex-1 text-left">
                                <div className={`font-semibold text-sm ${isActive ? config.color : 'text-gray-900'}`}>
                                  {config.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {config.description}
                                </div>
                              </div>
                              {isActive && (
                                <Icon name="Check" size={18} className={config.color} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Input Pill - Styled based on mode */}
                <div className={`flex-1 ${MODE_CONFIGS[aiMode].bgColor} h-[68px] rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-2 ${MODE_CONFIGS[aiMode].borderColor} pl-6 pr-2 flex items-center gap-4 transition-all focus-within:shadow-lg`}>
                    <div className={`w-10 h-10 rounded-full ${MODE_CONFIGS[aiMode].buttonBg} flex items-center justify-center shrink-0`}>
                      <Icon name={MODE_CONFIGS[aiMode].icon as any} size={20} className={MODE_CONFIGS[aiMode].color} />
                    </div>
                    <input
                        type="text"
                        placeholder={MODE_CONFIGS[aiMode].placeholder}
                        className={`flex-1 bg-transparent border-none outline-none text-[18px] ${MODE_CONFIGS[aiMode].color} placeholder-slate-400 h-full font-normal`}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                            prompt
                            ? `${MODE_CONFIGS[aiMode].buttonBg} ${MODE_CONFIGS[aiMode].color} ${MODE_CONFIGS[aiMode].buttonHover}`
                            : 'bg-[#F2F2F2] text-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <Icon name="ArrowRight" size={24} />
                    </button>
                </div>
            </div>

            {/* Right: Zoom & Help */}
            <div className="pointer-events-auto flex items-center gap-3">
                <div className="bg-white rounded-full shadow-sm border border-gray-200 h-11 px-4 flex items-center gap-3 text-sm font-medium text-slate-600">
                    <button onClick={() => setViewport(v => ({...v, scale: Math.max(0.1, v.scale - 0.1)}))} className="hover:text-slate-900 px-1 text-lg leading-none pb-0.5">-</button>
                    <span className="w-10 text-center select-none">{Math.round(viewport.scale * 100)}%</span>
                    <button onClick={() => setViewport(v => ({...v, scale: Math.min(5, v.scale + 0.1)}))} className="hover:text-slate-900 px-1 text-lg leading-none pb-0.5">+</button>
                </div>
                <button className="w-11 h-11 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                    <span className="font-bold text-lg">?</span>
                </button>
            </div>
        </div>

        {/* Card Selector Modal */}
        <CardSelector
            isOpen={isCardSelectorOpen}
            onClose={() => setIsCardSelectorOpen(false)}
            onSelect={handleCardSelect}
            customCards={customCards}
            onCreateCard={handleCreateCard}
        />

        {/* Help Modal */}
        {showHelpModal && (
          <>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setShowHelpModal(false)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="HelpCircle" size={32} className="text-[#8576C7]" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  需要帮助？
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  企业微信找到 <span className="font-semibold text-[#8576C7]">蔡可豪</span>
                  <br />
                  任何需求 <span className="font-semibold text-[#8576C7]">2h 之内回复</span>
                </p>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-6 py-3 bg-[#8576C7] text-white rounded-full hover:bg-[#7463B8] transition-colors font-medium"
                >
                  知道了
                </button>
              </div>
            </div>
          </>
        )}
    </div>
  );
};

export default Editor;