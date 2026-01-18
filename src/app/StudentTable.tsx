"use client";
import { useState } from "react";
import { Trophy, AlertCircle, User } from "lucide-react";
import { Student, Assignment, Class } from "./data";

export default function StudentTable({ students, assignments, classes }: { students: Student[]; assignments: Assignment[]; classes?: Class[] }) {
  const [selectedClassId, setSelectedClassId] = useState<string | "all">("all");

  const filteredStudents = selectedClassId === "all" 
    ? students 
    : students.filter(s => s.classId === selectedClassId);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Student Leaderboard</h3>
        {classes ? (
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
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4 text-center">Assignments</th>
              <th className="px-6 py-4 text-right">Total Points</th>
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
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{student.name}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {student.classId}
                  </span>
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
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}