import { useState } from "react";
import AcademicYearsPage from "./AcademicYearsPage";
import AcademicTermsPage from "./AcademicTermsPage";
import ClassLevelsPage from "./ClassLevelsPage";
import ProgramsPage from "./ProgramsPage";
import SubjectsPage from "./SubjectsPage";
import YearGroupsPage from "./YearGroupsPage";

const TABS = [
  { id: "years", label: "Academic Years", Component: AcademicYearsPage },
  { id: "terms", label: "Academic Terms", Component: AcademicTermsPage },
  { id: "levels", label: "Class Levels", Component: ClassLevelsPage },
  { id: "programs", label: "Programs", Component: ProgramsPage },
  { id: "subjects", label: "Subjects", Component: SubjectsPage },
  { id: "yearGroups", label: "Year Groups", Component: YearGroupsPage },
];

function AcademicSetupPage() {
  const [activeTab, setActiveTab] = useState("years");

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Academic Setup</h1>

      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-slate-800 text-slate-800"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

export default AcademicSetupPage;
