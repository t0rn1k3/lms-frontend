/**
 * API endpoints for the LMS backend.
 * Base URL is configured in apiClient.js
 */

export const endpoints = {
  // Auth
  admins: {
    register: "/admins/register",
    login: "/admins/login",
    profile: "/admins/profile",
    list: "/admins",
    update: "/admins",
    delete: (id) => `/admins/${id}`,
    examResults: "/admins/exam-results",
    exams: "/admins/exams",
    examsGetOne: (id) => `/admins/exams/${id}`,
    questions: "/admins/questions",
    questionsGetOne: (id) => `/admins/questions/${id}`,
    questionsCreate: (examId) => `/admins/questions/${examId}`,
    questionsUpdate: (id) => `/admins/questions/${id}`,
  },
  teachers: {
    register: "/teachers/admin/register",
    login: "/teachers/login",
    profile: "/teachers/profile",
    profileUpdate: "/teachers/profile",
    list: "/teachers/admin",
    getOne: (id) => `/teachers/${id}/admin`,
    update: (id) => `/teachers/${id}`,
  },
  students: {
    register: "/students/admin/register",
    login: "/students/login",
    profile: "/students/profile",
    profileUpdate: "/students/profile",
    examsList: "/students/exams",
    getExam: (examId) => `/students/exams/${examId}`,
    list: "/students/admin",
    getOne: (id) => `/students/${id}/admin`,
    update: (id) => `/students/${id}/admin`,
    writeExam: (examId) => `/students/exams/${examId}`,
  },

  // Academic
  academicYears: {
    list: "/academic-years",
    create: "/academic-years",
    getOne: (id) => `/academic-years/${id}`,
    update: (id) => `/academic-years/${id}`,
    delete: (id) => `/academic-years/${id}`,
  },
  academicTerms: {
    list: "/academic-terms",
    create: "/academic-terms",
    getOne: (id) => `/academic-terms/${id}`,
    update: (id) => `/academic-terms/${id}`,
    delete: (id) => `/academic-terms/${id}`,
  },
  classLevels: {
    list: "/class-levels",
    create: "/class-levels",
    getOne: (id) => `/class-levels/${id}`,
    update: (id) => `/class-levels/${id}`,
    delete: (id) => `/class-levels/${id}`,
  },
  programs: {
    list: "/programs",
    create: "/programs",
    getOne: (id) => `/programs/${id}`,
    update: (id) => `/programs/${id}`,
    delete: (id) => `/programs/${id}`,
  },
  subjects: {
    list: "/subjects",
    create: (programId) => `/subjects/${programId}`,
    getOne: (id) => `/subjects/${id}`,
    update: (id) => `/subjects/${id}`,
    delete: (id) => `/subjects/${id}`,
  },
  yearGroups: {
    list: "/year-groups",
    create: "/year-groups",
    getOne: (id) => `/year-groups/${id}`,
    update: (id) => `/year-groups/${id}`,
    delete: (id) => `/year-groups/${id}`,
  },

  // Exams & Results
  exams: {
    list: "/exams",
    create: "/exams",
    getOne: (id) => `/exams/${id}`,
    update: (id) => `/exams/${id}`,
  },
  questions: {
    list: "/questions",
    create: (examId) => `/questions/${examId}`,
    getOne: (id) => `/questions/${id}`,
    update: (id) => `/questions/${id}`,
  },
  examResults: {
    list: "/exam-results",
    adminList: "/admins/exam-results",
    getOne: (id) => `/exam-results/${id}`,
    togglePublish: (id) => `/exam-results/${id}`,
  },
};
