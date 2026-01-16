"use client";
import { useState, useMemo } from "react";
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
  Plus
} from "lucide-react";
import { 
  initialClasses,
  initialStudents,
  Student,
  Class,
  Assignment
} from "./data";
import { 
  AssignmentPerformanceChart, 
  ClassRankingChart 
} from "./AnalyticsChart";
import StudentTable from "./StudentTable";

export default function Dashboard() {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState<"dashboard" | "classes" | "assignments">("dashboard");
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  // Selection State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Form State
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhoto, setNewStudentPhoto] = useState<File | null>(null);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentPoints, setNewAssignmentPoints] = useState(100);
  const [selectedAssignmentClasses, setSelectedAssignmentClasses] = useState<string[]>([]);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);

  // New Class State
  const [newClassName, setNewClassName] = useState("");

  // Edit Class State
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [tempClassName, setTempClassName] = useState("");

  // --- Derived Data for Dashboard ---
  const leaderboard = useMemo(() => {
    return [...students].sort((a, b) => b.points - a.points);
  }, [students]);

  const classPerformance = useMemo(() => {
    return classes.map(cls => {
      const classStudents = students.filter(s => s.classId === cls.id);
      const totalPoints = classStudents.reduce((acc, curr) => acc + curr.points, 0);
      const avgPoints = classStudents.length ? totalPoints / classStudents.length : 0;
      return { name: cls.name, points: Math.round(avgPoints) };
    });
  }, [classes, students]);

  const assignmentStats = useMemo(() => {
    // Mocking stats based on created assignments for visualization
    return assignments.map(a => ({
      name: a.title,
      average: Math.floor(Math.random() * 30) + 70, // Random mock data for chart
      submissions: Math.floor(Math.random() * students.length)
    }));
  }, [assignments, students]);

  const classAssignmentCounts = useMemo(() => {
    return classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      count: assignments.filter(a => a.classIds.includes(cls.id)).length
    }));
  }, [classes, assignments]);

  const totalStudents = students.length;
  const totalAssignments = assignments.length;
  const totalSubmissions = students.reduce((acc, s) => acc + s.assignmentsCompleted, 0);

  // --- Helper: Recalculate Student Stats ---
  const updateStudentStats = (currentAssignments: Assignment[]) => {
    setStudents(prevStudents => prevStudents.map(student => {
      let points = 0;
      let completed = 0;
      
      currentAssignments.forEach(assignment => {
        const sub = assignment.submissions.find(s => s.studentId === student.id);
        if (sub && sub.submitted) {
          completed++;
          points += sub.grade || 0;
        }
      });

      return { ...student, points, assignmentsCompleted: completed };
    }));
  };

  // --- Handlers ---
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !selectedClassId) return;

    const photoUrl = newStudentPhoto ? URL.createObjectURL(newStudentPhoto) : undefined;

    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      name: newStudentName,
      classId: selectedClassId,
      photoUrl,
      points: 0,
      assignmentsCompleted: 0,
    };

    setStudents([...students, newStudent]);
    setNewStudentName("");
    setNewStudentPhoto(null);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    const newClass: Class = {
      id: `class-${Date.now()}`,
      name: newClassName
    };
    setClasses([...classes, newClass]);
    setNewClassName("");
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle || selectedAssignmentClasses.length === 0) return;

    const newAssignment: Assignment = {
      id: Math.random().toString(36).substr(2, 9),
      title: newAssignmentTitle,
      classIds: selectedAssignmentClasses,
      totalPoints: newAssignmentPoints,
      submissions: []
    };

    setAssignments([...assignments, newAssignment]);
    setNewAssignmentTitle("");
    setSelectedAssignmentClasses([]);
  };

  const toggleAssignmentClass = (classId: string) => {
    setSelectedAssignmentClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const startEditingClass = (cls: Class, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClassId(cls.id);
    setTempClassName(cls.name);
  };

  const saveClassName = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingClassId || !tempClassName.trim()) return;
    
    setClasses(classes.map(c => 
      c.id === editingClassId ? { ...c, name: tempClassName } : c
    ));
    setEditingClassId(null);
    setTempClassName("");
  };

  const cancelEditingClass = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClassId(null);
    setTempClassName("");
  };

  const handleSubmissionChange = (assignmentId: string, studentId: string, field: 'submitted' | 'grade', value: any) => {
    const updatedAssignments = assignments.map(a => {
      if (a.id !== assignmentId) return a;

      const existingSubmission = a.submissions.find(s => s.studentId === studentId);
      let newSubmissions = [...a.submissions];

      if (existingSubmission) {
        newSubmissions = newSubmissions.map(s => 
          s.studentId === studentId ? { ...s, [field]: value } : s
        );
      } else {
        newSubmissions.push({
          studentId,
          submitted: field === 'submitted' ? value : false,
          grade: field === 'grade' ? value : 0
        });
      }

      return { ...a, submissions: newSubmissions };
    });

    setAssignments(updatedAssignments);
    updateStudentStats(updatedAssignments);
  };

  const handleSelectAllForClass = (assignmentId: string, classId: string, checked: boolean) => {
    const classStudents = students.filter(s => s.classId === classId);
    const updatedAssignments = assignments.map(a => {
      if (a.id !== assignmentId) return a;

      let newSubmissions = [...a.submissions];
      
      classStudents.forEach(student => {
        const existingIdx = newSubmissions.findIndex(s => s.studentId === student.id);
        if (existingIdx >= 0) {
          newSubmissions[existingIdx] = { 
            ...newSubmissions[existingIdx], 
            submitted: checked 
          };
        } else {
          newSubmissions.push({
            studentId: student.id,
            submitted: checked,
            grade: 0
          });
        }
      });

      return { ...a, submissions: newSubmissions };
    });

    setAssignments(updatedAssignments);
    updateStudentStats(updatedAssignments);
  };

  const toggleAssignmentExpand = (id: string) => {
    setExpandedAssignmentId(expandedAssignmentId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex font-sans">
      {/* Sidebar Navigation */}
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
          <button 
            onClick={() => setActiveTab("classes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'classes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <Users size={20} /> Classes
          </button>
          <button 
            onClick={() => setActiveTab("assignments")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'assignments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <ClipboardList size={20} /> Assignments
          </button>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">K</div>
            <div>
              <p className="text-sm font-medium">Mdm Karuna</p>
              <p className="text-xs text-zinc-400">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">{activeTab}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your {activeTab} and track progress.</p>
        </header>

        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium dark:text-zinc-400">Total Students</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalStudents}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-center gap-4 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-900/20 dark:text-emerald-400">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium dark:text-zinc-400">Pending Assignments</p>
                  </div>
                </div>
                <div className="space-y-2 pl-2">
                  {classAssignmentCounts.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm"><span className="text-zinc-600 dark:text-zinc-400">{item.name}</span><span className="font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-xs">{item.count}</span></div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg dark:bg-amber-900/20 dark:text-amber-400">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium dark:text-zinc-400">Assignments Submitted</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalSubmissions}</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AssignmentPerformanceChart data={assignmentStats} />
              <ClassRankingChart data={classPerformance} />
            </div>

            {/* Leaderboard Section */}
            <StudentTable students={leaderboard} assignments={assignments} />
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
                        <button onClick={saveClassName} className="p-1 text-green-600 hover:bg-green-50 rounded dark:hover:bg-green-900/30"><Check size={18} /></button>
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

                <StudentTable students={students.filter(s => s.classId === selectedClassId)} assignments={assignments} />
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

            <div className="grid gap-4">
              {assignments.map(assignment => (
                <div key={assignment.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
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
                    <div className="text-right">
                      <span className="block text-xs font-medium text-zinc-500 uppercase">Total Points</span>
                      <span className="text-lg font-bold text-indigo-600">{assignment.totalPoints}</span>
                    </div>
                  </div>
                  
                  {expandedAssignmentId === assignment.id && (
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
              {assignments.length === 0 && (
                <p className="text-center text-zinc-500 py-8">No assignments created yet.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
