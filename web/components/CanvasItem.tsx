import React, { useState } from 'react';
import { CanvasElement } from '../types';
import { Icon } from './ui/Icon';

interface CanvasItemProps {
  element: CanvasElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart?: (e: React.MouseEvent, id: string, handle: string) => void;
  onSaveToCards?: (imageUrl: string) => void;
}

const CARD_TYPE_COLORS = {
  hook: { bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'bg-yellow-100 text-yellow-700', text: 'Hook' },
  inspiration: { bg: 'bg-purple-50', border: 'border-purple-200', label: 'bg-purple-100 text-purple-700', text: 'Inspiration' },
  template: { bg: 'bg-blue-50', border: 'border-blue-200', label: 'bg-blue-100 text-blue-700', text: 'Template' },
  product: { bg: 'bg-green-50', border: 'border-green-200', label: 'bg-green-100 text-green-700', text: 'Product' },
  constraint: { bg: 'bg-red-50', border: 'border-red-200', label: 'bg-red-100 text-red-700', text: 'Constraint' },
};

export const CanvasItem: React.FC<CanvasItemProps> = ({ element, isSelected, onMouseDown, onResizeStart, onSaveToCards }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (onResizeStart) {
      onResizeStart(e, element.id, handle);
    }
  };

  const handleSaveToCards = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSaveToCards && element.content) {
      onSaveToCards(element.content);
    }
  };
  const renderCardContent = () => {
    if (element.type !== 'card' || !element.cardType) return null;

    const colorScheme = CARD_TYPE_COLORS[element.cardType];
    const hasImage = !!element.imageContent;
    const hasText = !!element.textContent;

    return (
      <div className={`w-full h-full flex flex-col ${colorScheme.bg} border-2 ${colorScheme.border}`}>
        {/* Card Type Label */}
        <div className="px-3 py-2 flex items-center justify-between border-b-2 border-current/10 shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${colorScheme.label}`}>
            {colorScheme.text}
          </span>
        </div>

        {/* Content Area - 统一高度 */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Image Section - 有图片时显示 */}
          {hasImage && (
            <div className={`bg-white m-2 rounded overflow-hidden ${hasText ? 'flex-1' : 'flex-1'}`}>
              <img
                src={element.imageContent}
                alt="card"
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
              />
            </div>
          )}

          {/* Text Section - 有文本时显示 */}
          {hasText && (
            <div className={`px-3 bg-white/50 ${hasImage ? 'py-2 border-t-2 border-current/10 shrink-0' : 'flex-1 py-3 m-2 rounded bg-white'}`}>
              <textarea
                className={`w-full resize-none outline-none bg-transparent text-gray-800 text-sm leading-snug ${hasImage ? 'h-12' : 'h-full'}`}
                defaultValue={element.textContent || ''}
                readOnly={!isSelected}
                placeholder="输入卡片描述..."
              />
            </div>
          )}

          {/* 如果都没有，显示占位 */}
          {!hasImage && !hasText && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              空卡片
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`absolute group cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
        isSelected ? 'z-50' : 'z-10'
      }`}
      style={{
        transform: `translate(${element.x}px, ${element.y}px)`,
        width: element.width,
        height: element.height,
      }}
      onMouseDown={(e) => onMouseDown(e, element.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Toolbar - Only for image type */}
      {element.type === 'image' && isHovered && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1.5 bg-white rounded-lg shadow-lg border border-gray-200"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleSaveToCards}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-[#8576C7] rounded-md transition-colors"
            title="收藏到卡片集"
          >
            <Icon name="Bookmark" size={16} />
            <span>收藏</span>
          </button>
        </div>
      )}

      {/* Selection Border */}
      <div
        className={`absolute -inset-1 rounded-xl pointer-events-none border-2 transition-all ${
            isSelected ? 'border-[#8576C7] opacity-100' : 'border-transparent opacity-0 group-hover:opacity-50 group-hover:border-[#EADDFF]'
        }`}
      />

      {/* Content */}
      <div className="w-full h-full overflow-hidden rounded-lg shadow-sm bg-white border border-gray-100">
        {element.type === 'card' ? (
          renderCardContent()
        ) : element.type === 'image' ? (
          <img
            src={element.content}
            alt="canvas item"
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full p-4 flex items-center justify-center text-center">
            <textarea
              className="w-full h-full resize-none outline-none bg-transparent text-gray-800 font-medium text-lg text-center"
              defaultValue={element.content}
              readOnly={!isSelected}
            />
          </div>
        )}
      </div>

      {/* Resize Handles */}
      {isSelected && (
        <>
          {/* Corner Handles */}
          <div
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full cursor-nwse-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full cursor-nesw-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full cursor-nesw-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full cursor-nwse-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />

          {/* Edge Handles */}
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full cursor-ew-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
          <div
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full cursor-ew-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
        </>
      )}
    </div>
  );
};