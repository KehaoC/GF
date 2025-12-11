import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { projectsAPI } from '../services/api';
import type { Project } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // 初始化时直接从 localStorage 读取登录状态，避免竞态条件
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [userData, setUserData] = useState<{ username: string } | null>(() => {
    const storedUserData = localStorage.getItem('userData');
    return storedUserData ? JSON.parse(storedUserData) : null;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Load projects from backend
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        if (!isLoggedIn) {
          // 未登录只显示示例项目
          const examples = await projectsAPI.listExamples();
          setProjects(examples);
        } else {
          // 已登录：并行加载用户项目和示例项目
          const [userProjects, examples] = await Promise.all([
            projectsAPI.list(),
            projectsAPI.listExamples()
          ]);
          // 合并项目：用户项目在前，示例项目在后
          setProjects([...userProjects, ...examples]);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        // 加载失败时显示空列表
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, [isLoggedIn]);

  const handleCreateProject = async () => {
    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      navigate('/login');
      return;
    }

    try {
      // 调用 API 创建新项目
      const newProject = await projectsAPI.create({
        title: 'Untitled',
        thumbnail: '',
        elements: []
      });

      // 跳转到编辑器
      navigate(`/project/${newProject.id}`);
    } catch (error: any) {
      alert(error.message || '创建项目失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserData(null);
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="font-bold text-xl tracking-tight text-gray-900">Guru</div>
            <span className="px-2 py-0.5 rounded-full border border-gray-300 text-[10px] font-bold text-gray-600 tracking-wider">EXPERIMENT</span>
        </div>
        <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="text-sm text-gray-600">
                  你好，<span className="font-semibold text-[#8576C7]">{userData?.username}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EADDFF] to-[#8576C7] overflow-hidden border border-gray-200 flex items-center justify-center text-white font-semibold hover:shadow-md transition-shadow"
                  >
                    {userData?.username.charAt(0).toUpperCase()}
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                        <div className="p-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{userData?.username}</p>
                          <p className="text-xs text-gray-500 mt-0.5">已登录</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <Icon name="LogOut" size={16} />
                          退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-[#8576C7] text-white rounded-full hover:bg-[#7463B8] transition-colors text-sm font-medium"
              >
                <Icon name="LogIn" size={16} />
                登录
              </button>
            )}
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl font-medium text-slate-800">Welcome to Guru!</h1>
            <p className="text-xl text-slate-500 font-light">Explore, expand, and refine you ad creatives</p>
            
            {/* Ambient Background Glow */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-100/50 via-blue-100/50 to-pink-100/50 blur-[100px] -z-10 rounded-full pointer-events-none" />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
            <button
                onClick={handleCreateProject}
                className="flex items-center gap-2 bg-[#8576C7] hover:bg-[#7463B8] text-white px-6 py-3 rounded-full font-medium shadow-md transition-all hover:shadow-lg transform active:scale-95"
            >
                <Icon name="Plus" size={20} />
                New project
            </button>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium bg-white">
                Recent
                <Icon name="ChevronDown" size={16} />
            </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Create New Placeholder Card */}
            <div
                onClick={handleCreateProject}
                className="group cursor-pointer aspect-[4/3] bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between hover:border-[#EADDFF] hover:shadow-lg transition-all"
            >
                <div className="flex-1 border border-dashed border-gray-200 rounded flex items-center justify-center bg-gray-50 group-hover:bg-white transition-colors">
                    <span className="text-xs text-gray-400 font-medium">Add your text</span>
                </div>
                <div className="mt-4">
                    <h3 className="font-medium text-gray-900">Untitled</h3>
                    <p className="text-sm text-gray-400 mt-1">Today</p>
                </div>
            </div>

            {/* Loading State */}
            {isLoadingProjects && (
                <div className="col-span-full flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#8576C7]/30 border-t-[#8576C7] rounded-full animate-spin" />
                </div>
            )}

            {/* Projects */}
            {!isLoadingProjects && projects.map((project) => (
                <div 
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="group cursor-pointer aspect-[4/3] bg-white border border-gray-200 rounded-lg p-0 overflow-hidden flex flex-col hover:border-[#EADDFF] hover:shadow-lg transition-all"
                >
                    <div className="flex-1 bg-gray-50 relative overflow-hidden">
                        {project.thumbnail ? (
                             <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                             <div className="w-full h-full dot-grid opacity-50" />
                        )}
                        
                        {/* Collage effect elements simulation */}
                        {project.elements.length > 0 && !project.thumbnail && (
                            <div className="absolute inset-0 p-4">
                                {project.elements.slice(0,3).map((el, i) => (
                                    <div key={el.id} className="absolute bg-white shadow-sm p-1" style={{
                                        left: `${20 + i * 20}%`, top: `${20 + i * 10}%`, width: '40%', height: '40%', transform: `rotate(${i * 5}deg)`
                                    }}>
                                        {el.type === 'image' && <img src={el.content} className="w-full h-full object-cover" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-[#F9F7FF] border-t border-gray-100">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="font-medium text-gray-900 truncate pr-2 max-w-[180px]">{project.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{project.updatedAt}</p>
                             </div>
                             {project.isExample && (
                                <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">EXAMPLE</span>
                             )}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <footer className="mt-32 border-t border-gray-200 pt-8 flex justify-between items-center text-sm text-gray-500">
            <div className="text-lg font-medium text-gray-400">Guru Game</div>
            <div className="flex gap-6">
                <a href="#" className="hover:text-gray-800">Privacy</a>
                <a href="#" className="hover:text-gray-800">Terms of Service</a>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;