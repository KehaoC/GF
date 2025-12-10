import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { CanvasItem } from '../components/CanvasItem';
import { CardSelector } from '../components/CardSelector';
import { CanvasElement, Tool, Viewport } from '../types';
import { MOCK_PROJECTS, INITIAL_VIEWPORT, CardTemplate } from '../constants';
import { generateImageFromPrompt } from '../services/geminiService';

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

  // Initialize
  useEffect(() => {
    // Simulate fetching project
    const project = MOCK_PROJECTS.find(p => p.id === id);
    if (project) {
      setElements(project.elements);
    }
  }, [id]);

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

    // Deselect if clicking empty space
    if (activeTool === 'select' && e.target === canvasRef.current) {
      setSelectedIds(new Set());
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
    setIsPanning(false);
    setDraggedElementId(null);
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

  // AI Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
        const selectedElements = elements.filter(el => selectedIds.has(el.id));
        const newImageUrl = await generateImageFromPrompt(prompt, selectedElements);
        
        let startX = 0, startY = 0;
        if (selectedElements.length > 0) {
            startX = selectedElements[0].x + selectedElements[0].width + 20;
            startY = selectedElements[0].y;
        } else {
             const center = screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
             startX = center.x;
             startY = center.y;
        }

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
        setSelectedIds(new Set([newEl.id]));
        setPrompt('');
    } catch (error) {
        console.error("Generation failed", error);
    } finally {
        setIsGenerating(false);
    }
  };

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
                   <span className="text-[15px] font-medium text-gray-700">Untitled</span>
                   <div className="w-px h-4 bg-gray-300 mx-3" />
                   <Icon name="Maximize" size={14} className="text-gray-500 cursor-pointer hover:text-gray-800" />
                </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-3 pointer-events-auto mt-2">
                 <button className="flex items-center gap-2 px-5 h-10 text-[14px] font-medium text-gray-800 bg-[#F0F4F9] hover:bg-gray-200 rounded-full transition-colors">
                    <Icon name="Share2" size={18} />
                    Share
                 </button>
                 <button 
                    className="flex items-center gap-2 px-5 h-10 text-[14px] font-medium text-white bg-[#8576C7] hover:bg-[#7463B8] rounded-full shadow-sm transition-colors"
                 >
                    <Icon name="Sparkles" size={16} className="fill-current" />
                    Transform
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
                    />
                 ))}
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
                 {/* Plus Button */}
                <button 
                    className="w-[52px] h-[52px] bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all shrink-0"
                    onClick={handleAddText}
                >
                    <Icon name="Plus" size={28} strokeWidth={1.5} />
                </button>

                {/* Input Pill */}
                <div className="flex-1 bg-white h-[68px] rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-200 pl-8 pr-2 flex items-center gap-4 transition-all focus-within:shadow-[0_4px_20px_rgba(133,118,199,0.15)] focus-within:border-[#EADDFF]">
                    <input 
                        type="text" 
                        placeholder="What do you want to create?"
                        className="flex-1 bg-transparent border-none outline-none text-[19px] text-slate-600 placeholder-slate-400 h-full font-normal"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={!prompt}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                            prompt 
                            ? 'bg-[#EADDFF] text-[#4F378B] hover:bg-[#E0CFFF]' 
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
        />
    </div>
  );
};

export default Editor;