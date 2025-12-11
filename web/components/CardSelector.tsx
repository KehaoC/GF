import React, { useState, useRef } from 'react';
import { CardType } from '../types';
import { CardTemplate, CARD_LIBRARY } from '../constants';
import { Icon } from './ui/Icon';
import { uploadFile } from '../services/fileService';

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
    label: 'Hook',
    description: '描述一类可以稳定出量的素材的共性',
    icon: 'Zap',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  {
    type: 'inspiration',
    label: 'Inspiration',
    description: '竞品、热点、话题、IP 格式的灵感',
    icon: 'Lightbulb',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    type: 'template',
    label: 'Template',
    description: '强参考的模板卡片',
    icon: 'Layout',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    type: 'product',
    label: 'Product',
    description: '产品的截图',
    icon: 'Package',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    type: 'constraint',
    label: 'Constraint',
    description: '约束 Card，例如比例约束、风格约束等',
    icon: 'Lock',
    color: 'bg-red-100 text-red-700 border-red-200'
  }
];

interface CardSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (card: CardTemplate) => void;
  customCards?: CardTemplate[];
  onCreateCard?: (card: CardTemplate) => void;
  onDeleteCard?: (cardId: string) => void;
}

export const CardSelector: React.FC<CardSelectorProps> = ({ isOpen, onClose, onSelect, customCards = [], onCreateCard, onDeleteCard }) => {
  const [activeTab, setActiveTab] = useState<CardType>('hook');
  const [selectedCard, setSelectedCard] = useState<CardTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCardType, setNewCardType] = useState<CardType>('hook');
  const [newCardImagePreview, setNewCardImagePreview] = useState(''); // 用于预览的 base64
  const [newCardImageFile, setNewCardImageFile] = useState<File | null>(null); // 实际要上传的文件
  const [newCardText, setNewCardText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedCard) {
      onSelect(selectedCard);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedCard(null);
    setIsCreating(false);
    resetCreateForm();
    onClose();
  };

  const resetCreateForm = () => {
    setNewCardType('hook');
    setNewCardImagePreview('');
    setNewCardImageFile(null);
    setNewCardText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCardImageFile(file);
      // 创建预览
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewCardImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCard = async () => {
    if (!newCardImageFile) {
      alert('请上传图片');
      return;
    }

    setIsUploading(true);

    try {
      // 上传图片到服务器
      const imageUrl = await uploadFile(newCardImageFile);

      const newCard: CardTemplate = {
        id: `custom-${Date.now()}`,
        cardType: newCardType,
        title: newCardText ? newCardText.substring(0, 20) : '自定义卡片',
        imageContent: imageUrl,
        textContent: newCardText || ''
      };

      if (onCreateCard) {
        onCreateCard(newCard);
      }

      // Switch to the tab of the created card and close the create form
      setActiveTab(newCardType);
      setIsCreating(false);
      resetCreateForm();
    } catch (error: any) {
      alert(error.message || '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCard = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirmId === cardId) {
      // 确认删除
      if (onDeleteCard) {
        onDeleteCard(cardId);
      }
      setDeleteConfirmId(null);
      if (selectedCard?.id === cardId) {
        setSelectedCard(null);
      }
    } else {
      // 显示确认按钮
      setDeleteConfirmId(cardId);
    }
  };

  // 判断卡片是否是自定义卡片（可删除）
  // 检查卡片是否在 customCards 列表中
  const isCustomCard = (cardId: string) => customCards.some(card => card.id === cardId);

  // Merge library cards with custom cards
  const libraryCards = CARD_LIBRARY[activeTab];
  const customCardsOfType = customCards.filter(card => card.cardType === activeTab);
  const cardsInLibrary = [...libraryCards, ...customCardsOfType];
  const activeTabOption = CARD_OPTIONS.find(opt => opt.type === activeTab);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-5xl max-h-[85vh] flex flex-col">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreating ? '创建新卡片' : '卡片库'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isCreating ? '填写卡片信息并上传图片' : '选择一张卡片添加到画布'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 bg-[#8576C7] text-white text-sm font-medium rounded-lg hover:bg-[#7463B8] transition-colors flex items-center gap-2"
                >
                  <Icon name="Plus" size={16} />
                  创建卡片
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <Icon name="X" size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {!isCreating ? (
            <>
              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex px-6">
                  {CARD_OPTIONS.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => {
                        setActiveTab(option.type);
                        setSelectedCard(null);
                      }}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === option.type
                          ? 'border-[#8576C7] text-[#8576C7]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon name={option.icon as any} size={16} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content - Card Grid */}
              <div className="overflow-y-auto p-6 h-[500px]">
                <div className="mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${activeTabOption?.color}`}>
                    <Icon name={activeTabOption?.icon as any} size={14} />
                    <span className="font-medium">{activeTabOption?.description}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cardsInLibrary.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className={`relative p-3 rounded-xl border-2 transition-all text-left cursor-pointer group ${
                        selectedCard?.id === card.id
                          ? 'border-[#8576C7] bg-purple-50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Delete Button for custom cards */}
                      {isCustomCard(card.id) && (
                        <button
                          onClick={(e) => handleDeleteCard(card.id, e)}
                          className={`absolute top-1 right-1 z-10 p-1.5 rounded-full transition-all ${
                            deleteConfirmId === card.id
                              ? 'bg-red-500 text-white'
                              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                          }`}
                          title={deleteConfirmId === card.id ? '点击确认删除' : '删除卡片'}
                        >
                          <Icon name={deleteConfirmId === card.id ? 'Check' : 'Trash2'} size={14} />
                        </button>
                      )}
                      {/* Card Preview */}
                      <div className="aspect-[3/2] rounded-lg overflow-hidden mb-2 bg-gray-100">
                        <img
                          src={card.imageContent}
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {card.textContent && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {card.textContent}
                        </p>
                      )}
                    </div>
                  ))}

                  {cardsInLibrary.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      暂无卡片
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {!selectedCard && '请选择一张卡片'}
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
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Create Card Form */}
              <div className="overflow-y-auto p-6 h-[500px]">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Card Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      卡片类型
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {CARD_OPTIONS.map((option) => (
                        <button
                          key={option.type}
                          onClick={() => setNewCardType(option.type)}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                            newCardType === option.type
                              ? `${option.color} border-current`
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <Icon name={option.icon as any} size={20} />
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      卡片图片
                    </label>
                    <div className="space-y-3">
                      {newCardImagePreview ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={newCardImagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              setNewCardImagePreview('');
                              setNewCardImageFile(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Icon name="X" size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-[#8576C7] transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#8576C7]"
                        >
                          <Icon name="Upload" size={32} />
                          <span className="text-sm font-medium">点击上传图片</span>
                          <span className="text-xs">支持 JPG, PNG 格式</span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Card Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      卡片描述 <span className="text-gray-400 font-normal">(可选)</span>
                    </label>
                    <textarea
                      value={newCardText}
                      onChange={(e) => setNewCardText(e.target.value)}
                      placeholder="输入卡片描述文本..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8576C7] focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Create Form Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    resetCreateForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Icon name="ArrowLeft" size={16} />
                  返回
                </button>
                <button
                  onClick={handleCreateCard}
                  disabled={!newCardImageFile || isUploading}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    newCardImageFile && !isUploading
                      ? 'bg-[#8576C7] text-white hover:bg-[#7463B8]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isUploading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {isUploading ? '上传中...' : '创建卡片'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
