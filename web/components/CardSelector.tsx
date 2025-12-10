import React, { useState } from 'react';
import { CardType } from '../types';
import { CardTemplate, CARD_LIBRARY } from '../constants';
import { Icon } from './ui/Icon';

interface CardOption {
  type: CardType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const CARD_OPTIONS: CardOption[] = [
  {
    type: 'hook',
    label: 'Hook Card',
    description: '描述一类可以稳定出量的素材的共性',
    icon: 'Zap',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  {
    type: 'inspiration',
    label: 'Inspiration Card',
    description: '竞品、热点、话题、IP 格式的灵感',
    icon: 'Lightbulb',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    type: 'template',
    label: 'Template Card',
    description: '强参考的模板卡片',
    icon: 'Layout',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    type: 'product',
    label: 'Product Card',
    description: '产品的截图',
    icon: 'Package',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    type: 'constraint',
    label: 'Constraint Card',
    description: '约束 Card，例如比例约束、风格约束等',
    icon: 'Lock',
    color: 'bg-red-100 text-red-700 border-red-200'
  }
];

interface CardSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (card: CardTemplate) => void;
}

export const CardSelector: React.FC<CardSelectorProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedType, setSelectedType] = useState<CardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardTemplate | null>(null);

  if (!isOpen) return null;

  const handleBack = () => {
    setSelectedType(null);
    setSelectedCard(null);
  };

  const handleConfirm = () => {
    if (selectedCard) {
      onSelect(selectedCard);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setSelectedCard(null);
    onClose();
  };

  const currentTypeOption = CARD_OPTIONS.find(opt => opt.type === selectedType);
  const cardsInLibrary = selectedType ? CARD_LIBRARY[selectedType] : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              {selectedType && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <Icon name="ArrowLeft" size={20} className="text-gray-600" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedType ? currentTypeOption?.label : '选择卡片类型'}
                </h2>
                {selectedType && (
                  <p className="text-sm text-gray-500 mt-0.5">{currentTypeOption?.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <Icon name="X" size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedType ? (
              // Step 1: Select Card Type
              <div className="grid grid-cols-1 gap-3">
                {CARD_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setSelectedType(option.type)}
                    className={`p-4 rounded-xl border-2 ${option.color} hover:shadow-md transition-all text-left flex items-center gap-4 group`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon name={option.icon as any} size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">{option.label}</h3>
                      <p className="text-sm opacity-80">{option.description}</p>
                    </div>
                    <Icon name="ChevronRight" size={20} className="opacity-50" />
                  </button>
                ))}
              </div>
            ) : (
              // Step 2: Select Card from Library
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cardsInLibrary.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedCard?.id === card.id
                        ? 'border-[#8576C7] bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Card Preview */}
                    <div className="aspect-[3/2] rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <img
                        src={card.imageContent}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                      {card.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {card.textContent}
                    </p>
                  </button>
                ))}

                {cardsInLibrary.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    暂无卡片
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedType && !selectedCard && '请选择一张卡片'}
              {selectedCard && (
                <span className="text-purple-600 font-medium">
                  已选择：{selectedCard.title}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              {selectedType && (
                <button
                  onClick={handleConfirm}
                  disabled={!selectedCard}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCard
                      ? 'bg-[#8576C7] text-white hover:bg-[#7463B8]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  确认添加
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
