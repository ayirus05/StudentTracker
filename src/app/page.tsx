"use client";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ClipboardList,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
  Star,
  Menu,
  LogOut,
  Dices,
  Trash2
} from "lucide-react";
import Auth from "./Auth";
import { 
  AssignmentPerformanceChart, 
  ClassRankingChart,
  StudentExamChart
} from "./AnalyticsChart";
import StudentTable from "./StudentTable";
import Randomizer from "./Randomizer";
import { useDashboard } from "./useDashboard";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editAssignmentTitle, setEditAssignmentTitle] = useState("");
  const [editAssignmentPoints, setEditAssignmentPoints] = useState<number>(0);

  // Exam Edit State
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editExamTitle, setEditExamTitle] = useState("");
  const [editExamMaxScore, setEditExamMaxScore] = useState<number>(0);
  const {
    session,
    authLoading,
    handleLogout,
    activeTab, setActiveTab,
    classes,
    students,
    assignments,
    exams,
    selectedClassId, setSelectedClassId,
    filteredAssignments,
    selectedAssignmentViewClassId, setSelectedAssignmentViewClassId,
    selectedStudentForStats, setSelectedStudentForStats,
    newStudentName, setNewStudentName,
    newStudentFormClass, setNewStudentFormClass,
    newStudentPhoto, setNewStudentPhoto,
    newAssignmentTitle, setNewAssignmentTitle,
    selectedAssignmentClasses,
    expandedAssignmentId,
    newExamTitle, setNewExamTitle,
    newExamMaxScore, setNewExamMaxScore,
    selectedExamClasses,
    newClassName, setNewClassName,
    editingClassId,
    tempClassName, setTempClassName,
    leaderboard,
    classPerformance,
    assignmentStats,
    classAssignmentCounts,
    totalStudents,
    handleAddStudent,
    handleAddClass,
    handleAddAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    toggleAssignmentClass,
    startEditingClass,
    saveClassName,
    cancelEditingClass,
    handleSubmissionChange,
    handleSelectAllForClass,
    toggleAssignmentExpand,
    handleManualPointsChange,
    handleClassPointsChange,
    handleAddExam,
    handleUpdateExam,
    handleDeleteExam,
    toggleExamClass,
    handleExamScoreChange,
    getStudentExamData,
    handleDeleteStudent,
    handleUpdateStudent
  } = useDashboard();

  const handleSaveClass = (e: any) => {
    saveClassName(e);
  };

  const onUpdateAssignment = async (id: string) => {
    if (!editAssignmentTitle.trim()) return;
    const success = await handleUpdateAssignment(id, { title: editAssignmentTitle, totalPoints: editAssignmentPoints });
    if (success) {
      setEditingAssignmentId(null);
    }
  };

  const onUpdateExam = async (id: string) => {
    if (!editExamTitle.trim()) return;
    const success = await handleUpdateExam(id, { title: editExamTitle, maxScore: editExamMaxScore });
    if (success) {
      setEditingExamId(null);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-400 hover:text-white">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-indigo-400">EduTrack</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm text-white">K</div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-zinc-900 text-white flex flex-col fixed h-full border-r border-zinc-800 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-400">EduTrack</h1>
          <p className="text-zinc-400 text-xs mt-1">Teacher Dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab("classes"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'classes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <Users size={20} /> Classes
          </button>
          <button 
            onClick={() => { setActiveTab("assignments"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'assignments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <ClipboardList size={20} /> Assignments
          </button>
          <button 
            onClick={() => { setActiveTab("classPoints"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'classPoints' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <Star size={20} /> ClassPoints
          </button>
          <button 
            onClick={() => { setActiveTab("exams"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <FileText size={20} /> Exams
          </button>
          <button 
            onClick={() => { setActiveTab("randomizer"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'randomizer' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <Dices size={20} /> Randomizer
          </button>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">K</div>
              <div className="truncate">
                <p className="text-sm font-medium truncate">{session.user.email}</p>
                <p className="text-xs text-zinc-400">Teacher</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-zinc-400 hover:text-white transition-colors" title="Sign Out"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 pt-24 md:pt-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">{activeTab}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your {activeTab} and track progress.</p>
        </header>

        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-center gap-4 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">Total Students</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalStudents}</p>
                  </div>
                </div>
                <div className="space-y-2 pl-2">
                  {classes.map(cls => (
                    <button 
                      key={cls.id} 
                      onClick={() => { setSelectedClassId(cls.id); setActiveTab("classes"); }}
                      className="w-full flex justify-between items-center text-sm p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors text-left"
                    >
                      <span className="text-zinc-600 dark:text-zinc-400">{cls.name}</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-xs">{students.filter(s => s.classId === cls.id).length}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-center gap-4 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-900/20 dark:text-emerald-400">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">Pending Assignments</p>
                  </div>
                </div>
                <div className="space-y-2 pl-2">
                  {classAssignmentCounts.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => { setSelectedClassId(item.id); setActiveTab("assignments"); }}
                      className="w-full flex justify-between items-center text-sm p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors text-left"
                    >
                      <span className="text-zinc-600 dark:text-zinc-400">{item.name}</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-xs">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AssignmentPerformanceChart data={assignmentStats} />
              <ClassRankingChart data={classPerformance} />
            </div>

            {/* Leaderboard Section */}
            <StudentTable students={leaderboard} assignments={assignments} classes={classes} />
          </>
        )}

        {activeTab === "classes" && (
          <div className="space-y-6">
            {!selectedClassId ? (
              <>
              {/* Add Class Section */}
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Add New Class</h3>
                <form onSubmit={handleAddClass} className="flex gap-4">
                  <input 
                    type="text" 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700"
                    placeholder="Class Name (e.g., Class 12-B)"
                  />
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus size={18} /> Add Class</button>
                </form>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => (
                  <div 
                    key={cls.id} 
                    onClick={() => setSelectedClassId(cls.id)}
                    className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer dark:bg-zinc-900 dark:border-zinc-800 relative group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-900/20 dark:text-indigo-400">
                        <Users size={24} />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-zinc-100 text-zinc-600 rounded-full dark:bg-zinc-800 dark:text-zinc-400">
                        {students.filter(s => s.classId === cls.id).length} Students
                      </span>
                    </div>
                    
                    {editingClassId === cls.id ? (
                      <div className="flex items-center gap-2 mb-1" onClick={e => e.stopPropagation()}>
                        <input 
                          type="text" 
                          value={tempClassName}
                          onChange={e => setTempClassName(e.target.value)}
                          className="w-full px-2 py-1 text-lg font-bold border rounded border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          autoFocus
                        />
                        <button onClick={handleSaveClass} className="p-1 text-green-600 hover:bg-green-50 rounded dark:hover:bg-green-900/30"><Check size={18} /></button>
                        <button onClick={cancelEditingClass} className="p-1 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/30"><X size={18} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{cls.name}</h3>
                        <button 
                          onClick={(e) => startEditingClass(cls, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-indigo-600 transition-all"
                        ><Pencil size={16} /></button>
                      </div>
                    )}
                    <p className="text-sm text-zinc-500 mt-2">Click to manage students</p>
                  </div>
                ))}
              </div>
              </>
            ) : (
              <div>
                <button 
                  onClick={() => setSelectedClassId(null)}
                  className="mb-6 text-sm text-indigo-600 hover:underline font-medium"
                >
                  ← Back to Classes
                </button>
                
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm mb-8 dark:bg-zinc-900 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Add Student to {classes.find(c => c.id === selectedClassId)?.name}</h3>
                  <form onSubmit={handleAddStudent} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Student Name</label>
                      <input 
                        type="text" 
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Form Class</label>
                      <input 
                        type="text" 
                        value={newStudentFormClass}
                        onChange={(e) => setNewStudentFormClass(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700"
                        placeholder="e.g. 9A"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Photo (Optional)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setNewStudentPhoto(e.target.files?.[0] || null)}
                        className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                      />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                      Add Student
                    </button>
                  </form>
                </div>

                <StudentTable 
                  students={students.filter(s => s.classId === selectedClassId)} 
                  assignments={assignments} 
                  classes={classes}
                  disableClassFilter={true}
                  onDelete={handleDeleteStudent}
                  onEdit={handleUpdateStudent}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Create New Assignment</h3>
              <form onSubmit={handleAddAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Assignment Title</label>
                  <input 
                    type="text" 
                    value={newAssignmentTitle}
                    onChange={(e) => setNewAssignmentTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700"
                    placeholder="e.g., Math Quiz 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Assign to Classes</label>
                  <div className="flex flex-wrap gap-3">
                    {classes.map(cls => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleAssignmentClass(cls.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                          selectedAssignmentClasses.includes(cls.id)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  Create Assignment
                </button>
              </form>
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="assignment-class-filter" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Filter by Class:</label>
              <select 
                id="assignment-class-filter"
                value={selectedAssignmentViewClassId || ""} 
                onChange={(e) => setSelectedAssignmentViewClassId(e.target.value || null)}
                className="px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4">
              {filteredAssignments.map(assignment => (
                <div key={assignment.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                  {editingAssignmentId === assignment.id ? (
                    <div className="p-4 flex items-center gap-4" onClick={e => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editAssignmentTitle}
                        onChange={e => setEditAssignmentTitle(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Assignment Title"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500 font-medium">Max Pts:</span>
                        <input 
                          type="number" 
                          value={editAssignmentPoints}
                          onChange={e => setEditAssignmentPoints(parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => onUpdateAssignment(assignment.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Check size={20} /></button>
                        <button onClick={() => setEditingAssignmentId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={20} /></button>
                      </div>
                    </div>
                  ) : (
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    onClick={() => toggleAssignmentExpand(assignment.id)}
                  >
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {assignment.title}
                        {expandedAssignmentId === assignment.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </h4>
                      <p className="text-sm text-zinc-500 mt-1">
                        Assigned to: {assignment.classIds.map(id => classes.find(c => c.id === id)?.name).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="block text-xs font-medium text-zinc-500 uppercase">Total Points</span>
                        <span className="text-lg font-bold text-indigo-600">{assignment.totalPoints}</span>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            setEditingAssignmentId(assignment.id);
                            setEditAssignmentTitle(assignment.title);
                            setEditAssignmentPoints(assignment.totalPoints);
                          }}
                          className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Assignment"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Assignment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  )}
                  
                  {expandedAssignmentId === assignment.id && editingAssignmentId !== assignment.id && (
                    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 space-y-6">
                      {assignment.classIds.map(classId => {
                        const classObj = classes.find(c => c.id === classId);
                        const classStudents = students.filter(s => s.classId === classId);
                        if (!classObj) return null;

                        return (
                          <div key={classId} className="bg-white p-4 rounded-lg border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                              <h5 className="font-bold text-zinc-800 dark:text-zinc-200">{classObj.name}</h5>
                              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  onChange={(e) => handleSelectAllForClass(assignment.id, classId, e.target.checked)}
                                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Select All Submitted
                              </label>
                            </div>
                            <div className="space-y-2">
                              {classStudents.map(student => {
                                const submission = assignment.submissions.find(s => s.studentId === student.id);
                                return (
                                  <div key={student.id} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded dark:hover:bg-zinc-800/50">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-1/3">{student.name}</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={submission?.submitted || false}
                                        onChange={(e) => handleSubmissionChange(assignment.id, student.id, 'submitted', e.target.checked)}
                                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                      />
                                      <span className="text-sm text-zinc-500">Submitted</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-zinc-500">Grade:</span>
                                      <input 
                                        type="number" 
                                        max={assignment.totalPoints}
                                        value={submission?.grade ?? ""}
                                        onChange={(e) => handleSubmissionChange(assignment.id, student.id, 'grade', e.target.value === "" ? undefined : parseInt(e.target.value))}
                                        className="w-20 px-2 py-1 text-sm border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700"
                                      />
                                      <span className="text-sm text-zinc-400">/ {assignment.totalPoints}</span>
                                    </div>
                                  </div>
                                );
                              })}
                              {classStudents.length === 0 && <p className="text-sm text-zinc-400 italic">No students in this class.</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {filteredAssignments.length === 0 && (
                <p className="text-center text-zinc-500 py-8">{selectedAssignmentViewClassId ? "No assignments found for this class." : "No assignments created yet."}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "classPoints" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    selectedClassId === cls.id 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-900/20' 
                      : 'bg-white text-zinc-900 border-zinc-200 hover:border-indigo-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100'
                  }`}
                >
                  <h3 className="text-xl font-bold">{cls.name}</h3>
                  <p className={`text-sm mt-1 ${selectedClassId === cls.id ? 'text-indigo-100' : 'text-zinc-500'}`}>
                    {students.filter(s => s.classId === cls.id).length} Students
                  </p>
                </button>
              ))}
            </div>

            {selectedClassId && (
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Manage Points: {classes.find(c => c.id === selectedClassId)?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 font-medium hidden sm:inline">Class Actions:</span>
                    <button onClick={() => handleClassPointsChange(selectedClassId, -5)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">-5</button>
                    <button onClick={() => handleClassPointsChange(selectedClassId, -1)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">-1</button>
                    <button onClick={() => handleClassPointsChange(selectedClassId, 1)} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-sm font-bold transition-colors dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40">+1</button>
                    <button onClick={() => handleClassPointsChange(selectedClassId, 5)} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-sm font-bold transition-colors dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40">+5</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {students.filter(s => s.classId === selectedClassId).map(student => (
                    <div key={student.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 flex flex-col gap-4 transition-all hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-zinc-200 overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-zinc-600 shadow-sm">
                          {student.photoUrl ? <img src={student.photoUrl} className="h-full w-full object-cover" /> : <span className="text-sm font-bold">{student.name.charAt(0)}</span>}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">{student.name}</p>
                          <p className="text-xs text-zinc-500">Points: <span className="font-bold text-indigo-600">{student.manualPoints || 0}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <button onClick={() => handleManualPointsChange(student.id, -5)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 font-bold text-xs transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">-5</button>
                        <button onClick={() => handleManualPointsChange(student.id, -1)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 font-bold text-xs transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">-1</button>
                        <span className="flex-1 text-center font-bold text-zinc-700 dark:text-zinc-300">{student.manualPoints || 0}</span>
                        <button onClick={() => handleManualPointsChange(student.id, 1)} className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 font-bold text-xs transition-colors dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40">+1</button>
                        <button onClick={() => handleManualPointsChange(student.id, 5)} className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 font-bold text-xs transition-colors dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40">+5</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "exams" && (
          <div className="space-y-6">
            {/* Create Exam */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Add New Exam</h3>
              <form onSubmit={handleAddExam} className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Exam Title</label>
                    <input 
                      type="text" 
                      value={newExamTitle}
                      onChange={(e) => setNewExamTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700"
                      placeholder="e.g., Final Semester Exam"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Max Score</label>
                    <input 
                      type="number" 
                      value={newExamMaxScore}
                      onChange={(e) => setNewExamMaxScore(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Assign to Classes</label>
                  <div className="flex flex-wrap gap-3">
                    {classes.map(cls => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleExamClass(cls.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                          selectedExamClasses.includes(cls.id)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Add Exam</button>
              </form>
            </div>

            {/* Exam List */}
            <div className="grid gap-4">
              {exams.map(exam => (
                <div key={exam.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="p-4 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                    {editingExamId === exam.id ? (
                      <div className="flex items-center gap-4 w-full" onClick={e => e.stopPropagation()}>
                        <input 
                          type="text" 
                          value={editExamTitle}
                          onChange={e => setEditExamTitle(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Exam Title"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-500 font-medium">Max:</span>
                          <input 
                            type="number" 
                            value={editExamMaxScore}
                            onChange={e => setEditExamMaxScore(parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => onUpdateExam(exam.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Check size={20} /></button>
                          <button onClick={() => setEditingExamId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={20} /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{exam.title}</h4>
                          <p className="text-sm text-zinc-500">Max Score: {exam.maxScore}</p>
                          <p className="text-xs text-zinc-400 mt-1">Classes: {exam.classIds.map(id => classes.find(c => c.id === id)?.name).join(", ")}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingExamId(exam.id); setEditExamTitle(exam.title); setEditExamMaxScore(exam.maxScore); }} className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Exam">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDeleteExam(exam.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Exam">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800">
                        <tr>
                          <th className="px-4 py-2">Student</th>
                          <th className="px-4 py-2">Score</th>
                          <th className="px-4 py-2">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(s => exam.classIds.includes(s.classId)).map(student => {
                          const result = exam.results.find(r => r.studentId === student.id);
                          const score = result?.score || 0;
                          const percentage = Math.round((score / exam.maxScore) * 100);
                          return (
                            <tr key={student.id} className="border-b border-zinc-100 dark:border-zinc-800">
                              <td className="px-4 py-3 font-medium text-indigo-600 cursor-pointer hover:underline" onClick={() => setSelectedStudentForStats(student.id)}>
                                {student.name}
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="number" 
                                  value={result?.score ?? ""}
                                  onChange={(e) => handleExamScoreChange(exam.id, student.id, e.target.value === "" ? 0 : parseInt(e.target.value))}
                                  className="w-20 px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                />
                              </td>
                              <td className="px-4 py-3 font-bold text-zinc-700 dark:text-zinc-300">{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Student Exam Chart Modal/Overlay */}
            {selectedStudentForStats && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudentForStats(null)}>
                <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {students.find(s => s.id === selectedStudentForStats)?.name}
                    </h3>
                    <button onClick={() => setSelectedStudentForStats(null)} className="p-2 hover:bg-zinc-100 rounded-full dark:hover:bg-zinc-800"><X size={24} /></button>
                  </div>
                  <StudentExamChart 
                    data={getStudentExamData(selectedStudentForStats)} 
                    studentName={students.find(s => s.id === selectedStudentForStats)?.name || ""} 
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "randomizer" && (
          <Randomizer classes={classes} students={students} />
        )}
      </main>
    </div>
  );
}
