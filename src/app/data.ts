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

export const initialStudents: Student[] = [];

export const initialAssignments: Assignment[] = [];

export const initialExams: Exam[] = [];