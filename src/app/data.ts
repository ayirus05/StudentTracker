export type Student = {
  id: string;
  name: string;
  classId: string;
  photoUrl?: string;
  points: number;
  assignmentsCompleted: number;
  manualPoints: number;
};

export type Class = {
  id: string;
  name: string;
};

export type Submission = {
  studentId: string;
  submitted: boolean;
  grade?: number;
};

export type Assignment = {
  id: string;
  title: string;
  classIds: string[];
  totalPoints: number;
  submissions: Submission[];
};

export type Exam = {
  id: string;
  title: string;
  classIds: string[];
  maxScore: number;
  results: { studentId: string; score: number }[];
};

// Initial Data
export const initialClasses: Class[] = [
  { id: "Class 10-A", name: "Class 10-A" },
  { id: "Class 10-B", name: "Class 10-B" },
  { id: "Class 11-A", name: "Class 11-A" },
];

export const initialStudents: Student[] = [
  { id: "1", name: "Alice Johnson", classId: "Class 10-A", points: 130, assignmentsCompleted: 2, manualPoints: 10 },
  { id: "2", name: "Bob Smith", classId: "Class 10-A", points: 45, assignmentsCompleted: 1, manualPoints: 5 },
  { id: "3", name: "Charlie Brown", classId: "Class 10-B", points: 48, assignmentsCompleted: 1, manualPoints: 0 },
  { id: "4", name: "Diana Prince", classId: "Class 11-A", points: 112, assignmentsCompleted: 1, manualPoints: 20 },
  { id: "5", name: "Evan Wright", classId: "Class 10-B", points: 35, assignmentsCompleted: 1, manualPoints: 0 },
  { id: "6", name: "Fiona Gallagher", classId: "Class 11-A", points: 103, assignmentsCompleted: 1, manualPoints: 15 },
  { id: "7", name: "George Miller", classId: "Class 10-A", points: 5, assignmentsCompleted: 0, manualPoints: 5 },
  { id: "8", name: "Hannah Montana", classId: "Class 10-B", points: 52, assignmentsCompleted: 1, manualPoints: 10 },
  { id: "9", name: "Ian Somerhalder", classId: "Class 11-A", points: 95, assignmentsCompleted: 1, manualPoints: 10 },
  { id: "10", name: "Jessica Day", classId: "Class 10-A", points: 0, assignmentsCompleted: 0, manualPoints: 0 },
];

export const initialAssignments: Assignment[] = [
  {
    id: "assign-1",
    title: "Math Quiz 1",
    classIds: ["Class 10-A", "Class 10-B"],
    totalPoints: 50,
    submissions: [
      { studentId: "1", submitted: true, grade: 45 },
      { studentId: "2", submitted: true, grade: 40 },
      { studentId: "3", submitted: true, grade: 48 },
      { studentId: "5", submitted: true, grade: 35 },
      { studentId: "7", submitted: false },
      { studentId: "8", submitted: true, grade: 42 },
      { studentId: "10", submitted: false },
    ]
  },
  {
    id: "assign-2",
    title: "History Essay",
    classIds: ["Class 11-A", "Class 10-A"],
    totalPoints: 100,
    submissions: [
      { studentId: "4", submitted: true, grade: 92 },
      { studentId: "6", submitted: true, grade: 88 },
      { studentId: "9", submitted: true, grade: 85 },
      { studentId: "1", submitted: true, grade: 75 },
      { studentId: "2", submitted: false },
    ]
  }
];

export const initialExams: Exam[] = [
  {
    id: "exam-1",
    title: "Midterm Exam",
    classIds: ["Class 10-A", "Class 10-B", "Class 11-A"],
    maxScore: 100,
    results: [
      { studentId: "1", score: 85 },
      { studentId: "2", score: 78 },
      { studentId: "3", score: 90 },
      { studentId: "4", score: 95 },
      { studentId: "5", score: 70 },
      { studentId: "6", score: 88 },
    ]
  }
];