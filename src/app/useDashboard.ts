import { useState, useMemo, useEffect, FormEvent, MouseEvent } from "react";
import { Session } from "@supabase/supabase-js";
import { 
  initialClasses,
  initialStudents,
  initialAssignments,
  initialExams,
} from "./data";
import { supabase } from "./supabaseClient";

export interface Class {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  photoUrl?: string;
  manualPoints: number;
  points: number;
  assignmentsCompleted: number;
}

export interface Submission {
  studentId: string;
  submitted: boolean;
  grade?: number;
}

export interface Assignment {
  id: string;
  title: string;
  totalPoints: number;
  classIds: string[];
  submissions: Submission[];
}

export interface ExamResult {
  studentId: string;
  score: number;
}

export interface Exam {
  id: string;
  title: string;
  maxScore: number;
  classIds: string[];
  results: ExamResult[];
}

export const useDashboard = () => {
  // --- State Management ---
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "classes" | "assignments" | "classPoints" | "exams">("dashboard");
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]); 
  const [exams, setExams] = useState<Exam[]>([]);
  
  // Selection State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentForStats, setSelectedStudentForStats] = useState<string | null>(null);

  // Form State
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhoto, setNewStudentPhoto] = useState<File | null>(null);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentPoints, setNewAssignmentPoints] = useState(100);
  const [selectedAssignmentClasses, setSelectedAssignmentClasses] = useState<string[]>([]);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);

  // Exam Form State
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamMaxScore, setNewExamMaxScore] = useState(100);
  const [selectedExamClasses, setSelectedExamClasses] = useState<string[]>([]);

  // New Class State
  const [newClassName, setNewClassName] = useState("");

  // Edit Class State
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [tempClassName, setTempClassName] = useState("");

  // --- Auth & Session Management ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Fetch Data from Supabase ---
  useEffect(() => {
    if (!session) return;
    const fetchData = async () => {
      const [
        { data: classesData },
        { data: studentsData },
        { data: assignmentsData },
        { data: examsData }
      ] = await Promise.all([
        supabase.from('classes').select('*'),
        supabase.from('students').select('*'),
        supabase.from('assignments').select('*, submissions(*)'),
        supabase.from('exams').select('*, exam_results(*)')
      ]);

      // Initialize Classes (or seed if empty)
      if (classesData && classesData.length > 0) {
        setClasses(classesData);
      } else {
        // Optional: Seed initial classes if DB is empty
        const { data: inserted } = await supabase.from('classes').insert(initialClasses.map(c => ({ id: c.id, name: c.name }))).select();
        if (inserted) setClasses(inserted);
      }

      // Initialize Assignments
      let loadedAssignments: Assignment[] = [];
      if (assignmentsData) {
        loadedAssignments = assignmentsData.map((a: any) => ({
          id: a.id,
          title: a.title,
          classIds: a.class_ids || [],
          totalPoints: a.total_points,
          submissions: a.submissions.map((sub: any) => ({
            studentId: sub.student_id,
            submitted: sub.submitted,
            grade: sub.grade
          }))
        }));
        setAssignments(loadedAssignments);
      }

      // Initialize Students & Calculate Stats
      if (studentsData) {
        const loadedStudents = studentsData.map((s: any) => {
          // Calculate derived stats from loaded assignments
          let points = 0;
          let completed = 0;
          loadedAssignments.forEach(assignment => {
            const sub = assignment.submissions.find(sub => sub.studentId === s.id);
            if (sub && sub.submitted) {
              completed++;
              points += sub.grade || 0;
            }
          });

          return {
            id: s.id,
            name: s.name,
            classId: s.class_id,
            photoUrl: s.photo_url,
            manualPoints: s.manual_points || 0,
            points: points + (s.manual_points || 0),
            assignmentsCompleted: completed
          };
        });
        setStudents(loadedStudents);
      }

      // Initialize Exams
      if (examsData) {
        setExams(examsData.map((e: any) => ({
          id: e.id,
          title: e.title,
          classIds: e.class_ids || [],
          maxScore: e.max_score,
          results: e.exam_results.map((r: any) => ({ studentId: r.student_id, score: r.score }))
        })));
      }
    };
    fetchData();
  }, [session]);

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

      return { ...student, points: points + (student.manualPoints || 0), assignmentsCompleted: completed };
    }));
  };

  // --- Handlers ---
  const handleAddStudent = async (e: FormEvent) => {
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
      manualPoints: 0,
    };

    // Optimistic Update
    setStudents([...students, newStudent]);
    
    // DB Update
    await supabase.from('students').insert([{
      id: newStudent.id,
      name: newStudent.name,
      class_id: newStudent.classId,
      photo_url: newStudent.photoUrl, // Note: Blob URLs won't persist across sessions. Use Supabase Storage for real photos.
      manual_points: 0
    }]);

    setNewStudentName("");
    setNewStudentPhoto(null);
  };

  const handleAddClass = async (e: FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    const newClass: Class = {
      id: `class-${Date.now()}`,
      name: newClassName
    };
    setClasses([...classes, newClass]);
    
    await supabase.from('classes').insert([{ id: newClass.id, name: newClass.name }]);
    setNewClassName("");
  };

  const handleAddAssignment = async (e: FormEvent) => {
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

    await supabase.from('assignments').insert([{
      id: newAssignment.id,
      title: newAssignment.title,
      class_ids: newAssignment.classIds,
      total_points: newAssignment.totalPoints
    }]);

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

  const startEditingClass = (cls: Class, e: MouseEvent) => {
    e.stopPropagation();
    setEditingClassId(cls.id);
    setTempClassName(cls.name);
  };

  const saveClassName = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!editingClassId || !tempClassName.trim()) return;
    
    setClasses(classes.map(c => 
      c.id === editingClassId ? { ...c, name: tempClassName } : c
    ));

    await supabase.from('classes').update({ name: tempClassName }).eq('id', editingClassId);

    setEditingClassId(null);
    setTempClassName("");
  };

  const cancelEditingClass = (e: MouseEvent) => {
    e.stopPropagation();
    setEditingClassId(null);
    setTempClassName("");
  };

  const handleSubmissionChange = async (assignmentId: string, studentId: string, field: 'submitted' | 'grade', value: any) => {
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

    // DB Update
    const assignment = assignments.find(a => a.id === assignmentId);
    const existingSub = assignment?.submissions.find(s => s.studentId === studentId);
    
    await supabase.from('submissions').upsert({
      assignment_id: assignmentId,
      student_id: studentId,
      submitted: field === 'submitted' ? value : (existingSub?.submitted ?? false),
      grade: field === 'grade' ? value : (existingSub?.grade ?? 0)
    }, { onConflict: 'assignment_id,student_id' });
  };

  const handleSelectAllForClass = async (assignmentId: string, classId: string, checked: boolean) => {
    const classStudents = students.filter(s => s.classId === classId);
    const dbUpdates: any[] = [];

    const updatedAssignments = assignments.map(a => {
      if (a.id !== assignmentId) return a;

      let newSubmissions = [...a.submissions];
      
      classStudents.forEach(student => {
        const existingIdx = newSubmissions.findIndex(s => s.studentId === student.id);
        const grade = existingIdx >= 0 ? newSubmissions[existingIdx].grade : 0;

        dbUpdates.push({
          assignment_id: assignmentId,
          student_id: student.id,
          submitted: checked,
          grade: grade
        });

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

    if (dbUpdates.length > 0) {
      await supabase.from('submissions').upsert(dbUpdates, { onConflict: 'assignment_id,student_id' });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setAssignments(prev => prev.map(a => ({
      ...a,
      submissions: a.submissions.filter(sub => sub.studentId !== studentId)
    })));
    setExams(prev => prev.map(e => ({
      ...e,
      results: e.results.filter(r => r.studentId !== studentId)
    })));

    await supabase.from('students').delete().eq('id', studentId);
  };

  const handleUpdateStudentName = async (studentId: string, newName: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
    await supabase.from('students').update({ name: newName }).eq('id', studentId);
  };

  const toggleAssignmentExpand = (id: string) => {
    setExpandedAssignmentId(expandedAssignmentId === id ? null : id);
  };

  // --- Class Points Handlers ---
  const handleManualPointsChange = async (studentId: string, delta: number) => {
    let newPointsVal = 0;
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const newManualPoints = (s.manualPoints || 0) + delta;
      newPointsVal = newManualPoints;
      // Recalculate total points: (Current Total - Old Manual) + New Manual
      // Note: s.points currently includes s.manualPoints.
      const newTotalPoints = (s.points - (s.manualPoints || 0)) + newManualPoints;
      return { ...s, manualPoints: newManualPoints, points: newTotalPoints };
    }));
    
    await supabase.from('students').update({ manual_points: newPointsVal }).eq('id', studentId);
  };

  // --- Exam Handlers ---
  const handleAddExam = async (e: FormEvent) => {
    e.preventDefault();
    if (!newExamTitle || selectedExamClasses.length === 0) return;

    const newExam: Exam = {
      id: Math.random().toString(36).substr(2, 9),
      title: newExamTitle,
      classIds: selectedExamClasses,
      maxScore: newExamMaxScore,
      results: []
    };

    setExams([...exams, newExam]);

    await supabase.from('exams').insert([{
      id: newExam.id,
      title: newExam.title,
      class_ids: newExam.classIds,
      max_score: newExam.maxScore
    }]);

    setNewExamTitle("");
    setNewExamMaxScore(100);
    setSelectedExamClasses([]);
  };

  const toggleExamClass = (classId: string) => {
    setSelectedExamClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleExamScoreChange = async (examId: string, studentId: string, score: number) => {
    setExams(prev => prev.map(exam => {
      if (exam.id !== examId) return exam;
      
      const existingResultIndex = exam.results.findIndex(r => r.studentId === studentId);
      let newResults = [...exam.results];

      if (existingResultIndex >= 0) {
        newResults[existingResultIndex] = { ...newResults[existingResultIndex], score };
      } else {
        newResults.push({ studentId, score });
      }

      return { ...exam, results: newResults };
    }));

    await supabase.from('exam_results').upsert({
      exam_id: examId,
      student_id: studentId,
      score: score
    }, { onConflict: 'exam_id,student_id' });
  };

  const getStudentExamData = (studentId: string) => {
    return exams.map(exam => {
      const result = exam.results.find(r => r.studentId === studentId);
      const percentage = result ? Math.round((result.score / exam.maxScore) * 100) : 0;
      return { exam: exam.title, percentage };
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setClasses([]);
    setStudents([]);
    setAssignments([]);
    setExams([]);
  };

  return {
    session,
    authLoading,
    activeTab, setActiveTab,
    handleLogout,
    classes,
    students,
    assignments,
    exams,
    selectedClassId, setSelectedClassId,
    selectedStudentForStats, setSelectedStudentForStats,
    newStudentName, setNewStudentName,
    newStudentPhoto, setNewStudentPhoto,
    newAssignmentTitle, setNewAssignmentTitle,
    newAssignmentPoints, setNewAssignmentPoints,
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
    totalAssignments,
    totalSubmissions,
    handleAddStudent,
    handleAddClass,
    handleAddAssignment,
    toggleAssignmentClass,
    startEditingClass,
    saveClassName,
    cancelEditingClass,
    handleSubmissionChange,
    handleSelectAllForClass,
    toggleAssignmentExpand,
    handleManualPointsChange,
    handleAddExam,
    toggleExamClass,
    handleExamScoreChange,
    getStudentExamData,
    handleDeleteStudent,
    handleUpdateStudentName
  };
};