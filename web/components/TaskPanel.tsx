import React from 'react';
import { Icon } from './ui/Icon';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface GenerationTask {
  id: string;
  prompt: string;
  status: TaskStatus;
  progress: number; // 0-100
  createdAt: number;
  resultImageUrl?: string;
  error?: string;
}

interface TaskPanelProps {
  tasks: GenerationTask[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTaskClick?: (task: GenerationTask) => void;
  onClearCompleted?: () => void;
}

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'pending':
      return <Icon name="Clock" size={14} className="text-gray-400" />;
    case 'running':
      return (
        <div className="w-3.5 h-3.5 border-2 border-[#8576C7]/30 border-t-[#8576C7] rounded-full animate-spin" />
      );
    case 'completed':
      return <Icon name="Check" size={14} className="text-green-500" />;
    case 'failed':
      return <Icon name="X" size={14} className="text-red-500" />;
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-200';
    case 'running':
      return 'bg-[#8576C7]';
    case 'completed':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
  }
};

const TaskItem: React.FC<{
  task: GenerationTask;
  onClick?: () => void;
}> = ({ task, onClick }) => {
  const truncatedPrompt = task.prompt.length > 20
    ? task.prompt.substring(0, 20) + '...'
    : task.prompt;

  return (
    <div
      className={`p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${
        task.status === 'completed' ? 'opacity-70' : ''
      }`}
      onClick={onClick}
    >
      {/* Header: Status icon + Prompt */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {getStatusIcon(task.status)}
        </div>
        <span className="text-sm font-medium text-gray-700 truncate flex-1">
          {truncatedPrompt}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${getStatusColor(task.status)}`}
          style={{ width: `${task.progress}%` }}
        />
      </div>

      {/* Status Text */}
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {task.status === 'pending' && '排队中'}
          {task.status === 'running' && `生成中 ${task.progress}%`}
          {task.status === 'completed' && '已完成'}
          {task.status === 'failed' && '失败'}
        </span>
        {task.status === 'completed' && task.resultImageUrl && (
          <div className="w-6 h-6 rounded overflow-hidden border border-gray-200">
            <img
              src={task.resultImageUrl}
              alt="Result"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const TaskPanel: React.FC<TaskPanelProps> = ({
  tasks,
  isExpanded,
  onToggleExpand,
  onTaskClick,
  onClearCompleted,
}) => {
  const runningCount = tasks.filter(t => t.status === 'running').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const hasCompletedTasks = completedCount > 0;

  // 如果没有任务，不显示面板
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 w-64 max-h-[400px] flex flex-col overflow-hidden animate-in slide-in-from-right-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Icon name="ListTodo" size={18} className="text-[#8576C7]" />
              <span className="text-sm font-semibold text-gray-800">生成队列</span>
            </div>
            {hasCompletedTasks && (
              <button
                onClick={onClearCompleted}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                清除已完成
              </button>
            )}
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            ))}
          </div>

          {/* Footer Stats */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {runningCount > 0 && `${runningCount} 生成中`}
                {runningCount > 0 && pendingCount > 0 && ' · '}
                {pendingCount > 0 && `${pendingCount} 排队中`}
                {runningCount === 0 && pendingCount === 0 && `${completedCount} 已完成`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggleExpand}
        className={`w-12 h-12 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center transition-all ${
          isExpanded
            ? 'bg-[#F4F2FA] text-[#6A5A9E]'
            : 'bg-white text-gray-500 hover:bg-gray-50'
        }`}
      >
        {/* Badge for running/pending tasks */}
        {(runningCount > 0 || pendingCount > 0) && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#8576C7] rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">
              {runningCount + pendingCount}
            </span>
          </div>
        )}
        <Icon name="ListTodo" size={20} />
      </button>
    </div>
  );
};
