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
  formClass: string;
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

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useDashboard = () => {
  // --- State Management ---
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "classes" | "assignments" | "classPoints" | "exams" | "randomizer">("dashboard");
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]); 
  const [exams, setExams] = useState<Exam[]>([]);
  
  // Selection State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentForStats, setSelectedStudentForStats] = useState<string | null>(null);

  // Form State
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentFormClass, setNewStudentFormClass] = useState("");
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
        { data: classesData, error: classesError },
        { data: studentsData, error: studentsError },
        { data: assignmentsData, error: assignmentsError },
        { data: submissionsData, error: submissionsError },
        { data: examsData, error: examsError },
        { data: examResultsData, error: examResultsError }
      ] = await Promise.all([
        supabase.from('classes').select('*').eq('user_id', session.user.id),
        supabase.from('students').select('*').eq('user_id', session.user.id),
        supabase.from('assignments').select('*').eq('user_id', session.user.id),
        supabase.from('submissions').select('*').eq('user_id', session.user.id),
        supabase.from('exams').select('*').eq('user_id', session.user.id),
        supabase.from('exam_results').select('*').eq('user_id', session.user.id)
      ]);

      if (classesError) console.error("Error fetching classes:", classesError);
      if (studentsError) console.error("Error fetching students:", studentsError);
      if (assignmentsError) console.error("Error fetching assignments:", assignmentsError);
      if (submissionsError) console.error("Error fetching submissions:", submissionsError);
      if (examsError) console.error("Error fetching exams:", examsError);
      if (examResultsError) console.error("Error fetching exam results:", examResultsError);

      // Initialize Classes (or seed if empty)
      if (classesData && classesData.length > 0) {
        setClasses(classesData);
      } else {
        // Optional: Seed initial classes if DB is empty
        const { data: inserted } = await supabase.from('classes').insert(initialClasses.map(c => ({ 
          id: c.id, 
          name: c.name,
          user_id: session.user.id 
        }))).select();
        if (inserted) setClasses(inserted);
      }

      // Initialize Assignments
      let loadedAssignments: Assignment[] = [];
      if (assignmentsData) {
        loadedAssignments = assignmentsData.map((a: any) => {
          const assignmentSubmissions = submissionsData 
            ? submissionsData.filter((s: any) => s.assignment_id === a.id)
            : [];
            
          return {
            id: a.id,
            title: a.title,
            classIds: a.class_ids || [],
            totalPoints: a.total_points ?? a.totalPoints,
            submissions: assignmentSubmissions.map((sub: any) => ({
            studentId: sub.student_id,
            submitted: sub.submitted,
            grade: sub.grade
            }))
          };
        });
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
            formClass: s.form_class || s.formClass || "",
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
        setExams(examsData.map((e: any) => {
          const examResults = examResultsData 
            ? examResultsData.filter((r: any) => r.exam_id === e.id)
            : [];

          return {
            id: e.id,
            title: e.title,
            classIds: e.class_ids || [],
            maxScore: e.max_score,
            results: examResults.map((r: any) => ({ studentId: r.student_id, score: r.score }))
          };
        }));
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
      id: generateUUID(),
      name: newStudentName,
      classId: selectedClassId,
      formClass: newStudentFormClass,
      photoUrl,
      points: 0,
      assignmentsCompleted: 0,
      manualPoints: 0,
    };

    // Optimistic Update
    setStudents(prev => [...prev, newStudent]);
    
    // DB Update
    const { error } = await supabase.from('students').insert([{
      id: newStudent.id,
      name: newStudent.name,
      class_id: newStudent.classId,
      form_class: newStudent.formClass,
      photo_url: newStudent.photoUrl, // Note: Blob URLs won't persist across sessions. Use Supabase Storage for real photos.
      manual_points: 0,
      user_id: session?.user.id
    }]);

    if (error) {
      console.error("Error adding student:", error);
      alert(`Failed to add student: ${error.message}`);
      setStudents(prev => prev.filter(s => s.id !== newStudent.id));
    } else {
      setNewStudentName("");
      setNewStudentFormClass("");
      setNewStudentPhoto(null);
    }
  };

  const handleAddClass = async (e: FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    const newClass: Class = {
      id: generateUUID(),
      name: newClassName
    };
    setClasses(prev => [...prev, newClass]);
    
    const { error } = await supabase.from('classes').insert([{ 
      id: newClass.id, 
      name: newClass.name,
      user_id: session?.user.id
    }]);

    if (error) {
      console.error("Error adding class:", error);
      alert(`Failed to add class: ${error.message}`);
      setClasses(prev => prev.filter(c => c.id !== newClass.id));
    } else {
      setNewClassName("");
    }
  };

  const handleAddAssignment = async (e: FormEvent): Promise<boolean> => {
    e.preventDefault();
    if (!newAssignmentTitle || selectedAssignmentClasses.length === 0) return false;

    try {
      const { data, error } = await supabase.from('assignments').insert([{
        id: generateUUID(),
        title: newAssignmentTitle,
        class_ids: selectedAssignmentClasses,
        total_points: newAssignmentPoints,
        user_id: session?.user.id
      }]).select().single();

      if (error) throw error;

      const newAssignment: Assignment = {
        id: data.id,
        title: data.title,
        classIds: data.class_ids || [],
        totalPoints: data.total_points,
        submissions: []
      };

      setAssignments(prev => [...prev, newAssignment]);
      setNewAssignmentTitle("");
      setSelectedAssignmentClasses([]);
      return true;
    } catch (error: any) {
      console.error("Error adding assignment:", error);
      alert(`Failed to add assignment: ${error.message}`);
      return false;
    }
  };

  const handleUpdateAssignment = async (id: string, updates: { title?: string, totalPoints?: number }): Promise<boolean> => {
    const originalAssignment = assignments.find(a => a.id === id);
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.totalPoints !== undefined) dbUpdates.total_points = updates.totalPoints;

    const { error } = await supabase.from('assignments').update(dbUpdates).eq('id', id);
    if (error) {
      console.error("Error updating assignment:", error);
      alert(`Failed to update assignment: ${error.message}`);
      if (originalAssignment) {
        setAssignments(prev => prev.map(a => a.id === id ? originalAssignment : a));
      }
      return false;
    }
    return true;
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    setAssignments(prev => prev.filter(a => a.id !== id));
    // Also remove submissions locally if needed, or just let them be orphaned in state until reload
    
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) {
      console.error("Error deleting assignment:", error);
      alert(`Failed to delete assignment: ${error.message}`);
      // Ideally revert state here on error
    }
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

  const saveClassName = async (e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (!editingClassId || !tempClassName.trim()) return;
    
    setClasses(classes.map(c => 
      c.id === editingClassId ? { ...c, name: tempClassName } : c
    ));

    const { error } = await supabase.from('classes').update({ name: tempClassName }).eq('id', editingClassId);
    
    if (error) {
      console.error("Error updating class:", error);
      alert(`Failed to update class: ${error.message}`);
    }

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
      grade: field === 'grade' ? value : (existingSub?.grade ?? 0),
      user_id: session?.user.id
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
          grade: grade,
          user_id: session?.user.id
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

  const handleUpdateStudent = async (studentId: string, updates: { name?: string, formClass?: string }) => {
    const originalStudent = students.find(s => s.id === studentId);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updates } : s));
    
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.formClass !== undefined) dbUpdates.form_class = updates.formClass;
    
    const { error } = await supabase.from('students').update(dbUpdates).eq('id', studentId);
    if (error) {
      console.error("Error updating student:", error);
      alert(`Failed to update student: ${error.message}`);
      if (originalStudent) {
        setStudents(prev => prev.map(s => s.id === studentId ? originalStudent : s));
      }
    }
  };

  const toggleAssignmentExpand = (id: string) => {
    setExpandedAssignmentId(expandedAssignmentId === id ? null : id);
  };

  // --- Class Points Handlers ---
  const handleManualPointsChange = async (studentId: string, delta: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const newManualPoints = (student.manualPoints || 0) + delta;

    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      // Recalculate total points: (Current Total - Old Manual) + New Manual
      // Note: s.points currently includes s.manualPoints.
      const newTotalPoints = (s.points - (s.manualPoints || 0)) + newManualPoints;
      return { ...s, manualPoints: newManualPoints, points: newTotalPoints };
    }));
    
    const { error } = await supabase.from('students').update({ manual_points: newManualPoints }).eq('id', studentId);
    if (error) {
      console.error("Error updating manual points:", error);
    }
  };

  const handleClassPointsChange = async (classId: string, delta: number) => {
    const classStudents = students.filter(s => s.classId === classId);
    if (classStudents.length === 0) return;

    const dbUpdates = classStudents.map(s => {
      const newManualPoints = (s.manualPoints || 0) + delta;
      return {
        id: s.id,
        name: s.name,
        class_id: s.classId,
        form_class: s.formClass,
        photo_url: s.photoUrl,
        manual_points: newManualPoints,
        user_id: session?.user.id
      };
    });

    setStudents(prev => prev.map(s => {
      if (s.classId !== classId) return s;
      const newManualPoints = (s.manualPoints || 0) + delta;
      const newTotalPoints = (s.points - (s.manualPoints || 0)) + newManualPoints;
      return { ...s, manualPoints: newManualPoints, points: newTotalPoints };
    }));

    const { error } = await supabase.from('students').upsert(dbUpdates);
    if (error) {
      console.error("Error updating class points:", error);
    }
  };

  // --- Exam Handlers ---
  const handleAddExam = async (e: FormEvent): Promise<boolean> => {
    e.preventDefault();
    if (!newExamTitle || selectedExamClasses.length === 0) return false;

    const newExam: Exam = {
      id: generateUUID(),
      title: newExamTitle,
      classIds: selectedExamClasses,
      maxScore: newExamMaxScore,
      results: []
    };

    setExams(prev => [...prev, newExam]);

    const { error } = await supabase.from('exams').insert([{
      id: newExam.id,
      title: newExam.title,
      class_ids: newExam.classIds,
      max_score: newExam.maxScore,
      user_id: session?.user.id
    }]);

    if (error) {
      console.error("Error adding exam:", error);
      alert(`Failed to add exam: ${error.message}`);
      setExams(prev => prev.filter(e => e.id !== newExam.id));
      return false;
    } else {
      setNewExamTitle("");
      setNewExamMaxScore(100);
      setSelectedExamClasses([]);
      return true;
    }
  };

  const handleUpdateExam = async (id: string, updates: { title?: string, maxScore?: number }): Promise<boolean> => {
    const originalExam = exams.find(e => e.id === id);
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.maxScore !== undefined) dbUpdates.max_score = updates.maxScore;

    const { error } = await supabase.from('exams').update(dbUpdates).eq('id', id);
    if (error) {
      console.error("Error updating exam:", error);
      alert(`Failed to update exam: ${error.message}`);
      if (originalExam) {
        setExams(prev => prev.map(e => e.id === id ? originalExam : e));
      }
      return false;
    }
    return true;
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    setExams(prev => prev.filter(e => e.id !== id));
    // Remove results locally
    
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) {
      console.error("Error deleting exam:", error);
      alert(`Failed to delete exam: ${error.message}`);
      // Ideally revert state here on error
    }
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
      score: score,
      user_id: session?.user.id
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
    newStudentFormClass, setNewStudentFormClass,
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
    handleUpdateAssignment,
    handleDeleteAssignment,
    handleUpdateExam,
    handleDeleteExam,
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
    toggleExamClass,
    handleExamScoreChange,
    getStudentExamData,
    handleDeleteStudent,
    handleUpdateStudent
  };
};