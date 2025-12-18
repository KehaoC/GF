import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Icon } from './ui/Icon';

// 内容片段类型
export interface ContentSegment {
  type: 'text' | 'image' | 'ref-text';
  content: string;
  preview?: string;
  refId?: string; // 关联的元素 ID
}

interface MixedInputProps {
  placeholder?: string;
  className?: string;
  onContentChange?: (segments: ContentSegment[]) => void;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
}

export interface MixedInputHandle {
  insertPill: (segment: ContentSegment) => void;
  clear: () => void;
  focus: () => void;
  getContent: () => ContentSegment[];
  isEmpty: () => boolean;
}

export const MixedInput = forwardRef<MixedInputHandle, MixedInputProps>(
  ({ placeholder = '', className = '', onContentChange, onEnter, onBackspaceEmpty }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const savedRangeRef = useRef<Range | null>(null);

    // 保存当前光标位置
    const saveSelection = useCallback(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedRangeRef.current = selection.getRangeAt(0).cloneRange();
      }
    }, []);

    // 恢复光标位置
    const restoreSelection = useCallback(() => {
      if (savedRangeRef.current && editorRef.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedRangeRef.current);
        }
      }
    }, []);

    // 解析编辑器内容为段落数组
    const parseContent = useCallback((): ContentSegment[] => {
      if (!editorRef.current) return [];

      const segments: ContentSegment[] = [];
      const childNodes = editorRef.current.childNodes;

      childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (text) {
            segments.push({ type: 'text', content: text });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.classList.contains('pill')) {
            const pillType = element.dataset.type as 'image' | 'ref-text';
            const content = element.dataset.content || '';
            const preview = element.dataset.preview || '';
            const refId = element.dataset.refId || '';
            segments.push({ type: pillType, content, preview, refId });
          }
        }
      });

      return segments;
    }, []);

    // 检查是否为空
    const isEmpty = useCallback((): boolean => {
      if (!editorRef.current) return true;
      const text = editorRef.current.textContent || '';
      const hasPills = editorRef.current.querySelectorAll('.pill').length > 0;
      return !text.trim() && !hasPills;
    }, []);

    // 创建胶囊元素
    const createPillElement = useCallback((segment: ContentSegment): HTMLSpanElement => {
      const pill = document.createElement('span');
      pill.className = `pill inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mx-0.5 align-middle select-none ${
        segment.type === 'image'
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'bg-amber-100 text-amber-700 border border-amber-200'
      }`;
      pill.contentEditable = 'false';
      pill.dataset.type = segment.type;
      pill.dataset.content = segment.content;
      pill.dataset.preview = segment.preview || '';
      pill.dataset.refId = segment.refId || '';

      // 图标
      const icon = document.createElement('span');
      icon.className = 'inline-flex';
      icon.innerHTML = segment.type === 'image'
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'
        : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>';
      pill.appendChild(icon);

      // 预览内容
      if (segment.type === 'image' && segment.preview) {
        const img = document.createElement('img');
        img.src = segment.preview;
        img.className = 'w-4 h-4 rounded object-cover';
        img.draggable = false;
        pill.appendChild(img);
      } else if (segment.preview) {
        const text = document.createElement('span');
        text.className = 'max-w-[80px] truncate';
        text.textContent = segment.preview;
        pill.appendChild(text);
      }

      // 删除按钮
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'ml-0.5 hover:bg-black/10 rounded-full p-0.5 cursor-pointer';
      deleteBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        pill.remove();
        onContentChange?.(parseContent());
      };
      pill.appendChild(deleteBtn);

      return pill;
    }, [onContentChange, parseContent]);

    // 在光标位置插入胶囊
    const insertPill = useCallback((segment: ContentSegment) => {
      if (!editorRef.current) return;

      const pill = createPillElement(segment);

      // 获取当前选区或使用保存的选区
      let selection = window.getSelection();
      let range: Range;

      if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
        range = selection.getRangeAt(0);
      } else if (savedRangeRef.current && editorRef.current.contains(savedRangeRef.current.startContainer)) {
        range = savedRangeRef.current;
      } else {
        // 如果没有有效选区，插入到末尾
        range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
      }

      // 插入胶囊
      range.deleteContents();
      range.insertNode(pill);

      // 移动光标到胶囊后面
      range.setStartAfter(pill);
      range.setEndAfter(pill);
      selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // 触发内容变化
      onContentChange?.(parseContent());

      // 保存新的光标位置
      saveSelection();
    }, [createPillElement, onContentChange, parseContent, saveSelection]);

    // 清空内容
    const clear = useCallback(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        onContentChange?.([]);
      }
    }, [onContentChange]);

    // 聚焦
    const focus = useCallback(() => {
      editorRef.current?.focus();
    }, []);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      insertPill,
      clear,
      focus,
      getContent: parseContent,
      isEmpty,
    }), [insertPill, clear, focus, parseContent, isEmpty]);

    // 处理输入事件
    const handleInput = useCallback(() => {
      saveSelection();
      onContentChange?.(parseContent());
    }, [saveSelection, onContentChange, parseContent]);

    // 处理键盘事件
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter?.();
      } else if (e.key === 'Backspace') {
        // 检查是否为空
        if (isEmpty()) {
          onBackspaceEmpty?.();
        }
      }
      saveSelection();
    }, [onEnter, onBackspaceEmpty, isEmpty, saveSelection]);

    // 处理粘贴事件，只允许纯文本
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }, []);

    // 处理失焦，保存光标位置
    const handleBlur = useCallback(() => {
      saveSelection();
    }, [saveSelection]);

    // 处理聚焦，恢复光标位置
    const handleFocus = useCallback(() => {
      // 如果编辑器为空，不需要恢复
      if (editorRef.current && editorRef.current.childNodes.length === 0) {
        return;
      }
      restoreSelection();
    }, [restoreSelection]);

    return (
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={`outline-none min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none ${className}`}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        onFocus={handleFocus}
        data-placeholder={placeholder}
        style={{
          wordBreak: 'break-word',
        }}
      />
    );
  }
);

MixedInput.displayName = 'MixedInput';
