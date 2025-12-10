import React from 'react';
import { CanvasElement } from '../types';

interface CanvasItemProps {
  element: CanvasElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
}

export const CanvasItem: React.FC<CanvasItemProps> = ({ element, isSelected, onMouseDown }) => {
  
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
    >
      {/* Selection Border */}
      <div 
        className={`absolute -inset-1 rounded-xl pointer-events-none border-2 transition-all ${
            isSelected ? 'border-[#8576C7] opacity-100' : 'border-transparent opacity-0 group-hover:opacity-50 group-hover:border-[#EADDFF]'
        }`} 
      />
      
      {/* Content */}
      <div className="w-full h-full overflow-hidden rounded-lg shadow-sm bg-white border border-gray-100">
        {element.type === 'image' ? (
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

      {/* Resize Handles (Visual Only for this demo) */}
      {isSelected && (
        <>
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#8576C7] rounded-full" />
        </>
      )}
    </div>
  );
};