import AcademyLocations from "@/app/components/AcademyLocations";
import {
  programSectionContainer,
  programSectionWrapper,
} from "@/app/components/program-page-layout";

export default function JuniorProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 flex flex-col">
      <div className={programSectionWrapper}>
        <div className={programSectionContainer}>{children}</div>
      </div>
      <AcademyLocations />
    </div>
  );
}
