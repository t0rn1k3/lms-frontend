import { useState } from "react";
import { useTranslation } from "react-i18next";
import AcademicYearsPage from "./AcademicYearsPage";
import AcademicTermsPage from "./AcademicTermsPage";
import ClassLevelsPage from "./ClassLevelsPage";
import ProgramsPage from "./ProgramsPage";
import SubjectsPage from "./SubjectsPage";
import YearGroupsPage from "./YearGroupsPage";

const TABS = [
  {
    id: "years",
    translationKey: "admin.academicYears",
    Component: AcademicYearsPage,
  },
  {
    id: "terms",
    translationKey: "admin.academicTerms",
    Component: AcademicTermsPage,
  },
  {
    id: "levels",
    translationKey: "admin.classLevels",
    Component: ClassLevelsPage,
  },
  { id: "programs", translationKey: "admin.programs", Component: ProgramsPage },
  { id: "subjects", translationKey: "admin.subjects", Component: SubjectsPage },
  {
    id: "yearGroups",
    translationKey: "admin.yearGroups",
    Component: YearGroupsPage,
  },
];

function AcademicSetupPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("years");

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {t("admin.academicSetup")}
      </h1>

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
              {t(tab.translationKey)}
            </button>
          ))}
        </nav>
      </div>

      <div>{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
}

export default AcademicSetupPage;
