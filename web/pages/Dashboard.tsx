import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { MOCK_PROJECTS } from '../constants';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="font-bold text-xl tracking-tight text-gray-900">Guru</div>
            <span className="px-2 py-0.5 rounded-full border border-gray-300 text-[10px] font-bold text-gray-600 tracking-wider">EXPERIMENT</span>
        </div>
        <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Icon name="MoreVertical" className="text-gray-600" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EADDFF] to-[#8576C7] overflow-hidden border border-gray-200">
                <img src="https://picsum.photos/id/64/100/100" alt="User" />
            </div>
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
                onClick={() => navigate(`/project/${Date.now()}`)}
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
                onClick={() => navigate(`/project/${Date.now()}`)}
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

            {MOCK_PROJECTS.map((project) => (
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
            <div className="text-lg font-medium text-gray-400">Google</div>
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