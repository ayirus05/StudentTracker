import { 
  LayoutDashboard, 
  Users, 
  ClipboardList,
  Star,
  FileText,
  Settings,
  Check,
  X
} from "lucide-react";
import { Class } from "../data";

interface SidebarProps {
  activeTab: "dashboard" | "classes" | "assignments" | "classPoints" | "exams";
  setActiveTab: (tab: "dashboard" | "classes" | "assignments" | "classPoints" | "exams") => void;
  classes: Class[];
  favoriteClassIds: string[];
  setFavoriteClassIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedClassId: (id: string | null) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  classes,
  favoriteClassIds,
  setFavoriteClassIds,
  setSelectedClassId,
  isSettingsOpen,
  setIsSettingsOpen
}: SidebarProps) {
  return (
    <>
      <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col fixed h-full border-r border-zinc-800">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-400">EduTrack</h1>
          <p className="text-zinc-400 text-xs mt-1">Teacher Dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <div className="group relative">
            <button 
              onClick={() => { setActiveTab("classes"); setSelectedClassId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'classes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            >
              <Users size={20} /> 
              <span className="flex-1 text-left">Classes</span>
            </button>
            <div className="hidden group-hover:block w-full mt-1 space-y-1">
              {classes.filter(cls => favoriteClassIds.includes(cls.id)).map(cls => (
                <button
                  key={cls.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("classes");
                    setSelectedClassId(cls.id);
                  }}
                  className="w-full text-left px-4 py-2 pl-12 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setActiveTab("assignments")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'assignments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <ClipboardList size={20} /> Assignments
          </button>
          <button 
            onClick={() => setActiveTab("classPoints")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'classPoints' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <Star size={20} /> ClassPoints
          </button>
          <button 
            onClick={() => setActiveTab("exams")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <FileText size={20} /> Exams
          </button>
        </nav>
        <div className="p-4 border-t border-zinc-800 space-y-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Settings size={16} /> Customize Sidebar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">K</div>
            <div>
              <p className="text-sm font-medium">Mdm Karuna</p>
              <p className="text-xs text-zinc-400">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Sidebar Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Navigation</h4>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 opacity-50 cursor-not-allowed">
                    <LayoutDashboard size={18} className="text-zinc-500" />
                    <span className="flex-1 font-medium text-zinc-500">Dashboard</span>
                    <Check size={16} className="text-indigo-500" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 opacity-50 cursor-not-allowed">
                    <ClipboardList size={18} className="text-zinc-500" />
                    <span className="flex-1 font-medium text-zinc-500">Assignments</span>
                    <Check size={16} className="text-indigo-500" />
                </div>
              </div>

              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Classes</h4>
              <div className="space-y-2">
                {classes.map(cls => (
                  <label key={cls.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox"
                      checked={favoriteClassIds.includes(cls.id)}
                      onChange={() => {
                        setFavoriteClassIds(prev => 
                          prev.includes(cls.id) ? prev.filter(id => id !== cls.id) : [...prev, cls.id]
                        );
                      }}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="flex-1 font-medium text-zinc-700 dark:text-zinc-300">{cls.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}