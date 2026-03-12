import ProgramCurriculumPage from "../admin/ProgramCurriculumPage";

/**
 * Teacher view: read-only curriculum with download.
 * Teachers can view and download curriculum for programs they teach.
 * Route: /teacher/curriculum/:id
 */
function TeacherCurriculumPage() {
  return (
    <ProgramCurriculumPage
      readOnly
      backTo="/teacher"
      backLabel="teacher.overview"
    />
  );
}

export default TeacherCurriculumPage;
