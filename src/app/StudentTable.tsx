"use client";
import { useState } from "react";
import { Trophy, AlertCircle, User, Pencil, Trash2, Check, X } from "lucide-react";
import { Student, Assignment, Class } from "./useDashboard";

export default function StudentTable({ 
  students, 
  assignments, 
  classes,
  onDelete,
  onEdit,
  disableClassFilter
}: { 
  students: Student[]; 
  assignments: Assignment[]; 
  classes?: Class[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updates: { name: string, formClass: string }) => void;
  disableClassFilter?: boolean;
}) {
  const [selectedClassId, setSelectedClassId] = useState<string | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFormClass, setEditFormClass] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredStudents = selectedClassId === "all" 
    ? students 
    : students.filter(s => s.classId === selectedClassId);

  const handleSaveEdit = (id: string) => {
    if (onEdit && editName.trim()) {
      onEdit(id, { name: editName, formClass: editFormClass });
    }
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (onDelete && deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <>
    {/* Custom Delete Modal */}
    {deletingId && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-sm w-full p-6 border border-zinc-200 dark:border-zinc-800 transform transition-all scale-100">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center dark:bg-red-900/30 dark:text-red-400">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Remove Student?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Are you sure you want to remove <span className="font-bold text-zinc-800 dark:text-zinc-200">{students.find(s => s.id === deletingId)?.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Student Leaderboard</h3>
        {classes && !disableClassFilter ? (
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedClassId("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedClassId === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              All Classes
            </button>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedClassId === cls.id
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
            Top Performers
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase font-semibold text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-500">
            <tr>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Photo</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Form Class</th>
              <th className="px-6 py-4 text-center">Assignments</th>
              <th className="px-6 py-4 text-right">Total Points</th>
              {(onEdit || onDelete) && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredStudents.map((student, index) => {
              const totalClassAssignments = assignments.filter(a => a.classIds.includes(student.classId)).length;
              return (
                <tr key={student.id} className="hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800/50">
                <td className="px-6 py-4 font-medium">
                  {index === 0 ? (
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  ) : index === 1 ? (
                    <Trophy className="w-5 h-5 text-gray-400" />
                  ) : index === 2 ? (
                    <Trophy className="w-5 h-5 text-amber-600" />
                  ) : (
                    `#${index + 1}`
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} alt={student.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {editingId === student.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Name"
                      />
                      <button onClick={() => handleSaveEdit(student.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={14} /></button>
                    </div>
                  ) : (
                    student.name
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === student.id ? (
                    <input 
                      type="text" 
                      value={editFormClass} 
                      onChange={(e) => setEditFormClass(e.target.value)}
                      className="w-20 px-2 py-1 text-sm border rounded border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Class"
                    />
                  ) : (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{student.formClass || "-"}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {student.assignmentsCompleted}
                    {student.assignmentsCompleted < totalClassAssignments && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                  {student.points.toLocaleString()} pts
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button 
                          onClick={() => { setEditingId(student.id); setEditName(student.name); setEditFormClass(student.formClass); }}
                          className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors dark:hover:bg-indigo-900/30"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => setDeletingId(student.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}