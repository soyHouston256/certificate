export interface Student {
  name: string;
  document: string;
}

export interface Course {
  name: string;
  date: string;
  node: string;
  backgroud: string;
  students: Student[];
}
