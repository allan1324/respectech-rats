import type { ClassInfo } from "./classes";

export type ClassSlug = ClassInfo["slug"];

export type Assignment = {
  classSlug: ClassSlug;
  title: string;
  description: string;
  modelAnswer: string;
  createdAt: string; // ISO string
};

export type Submission = {
  classSlug: ClassSlug;
  assignmentCreatedAt: string;
  studentName: string;
  answer: string;
  submittedAt: string; // ISO string
};

export type Teacher = {
  firstName: string;
  lastName: string;
};

export type Student = {
  registrationNumber: string;
  fullName: string;
  email?: string;
  classSlug: string;
};
