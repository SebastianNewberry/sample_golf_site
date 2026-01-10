import AcademyLocations from "@/app/components/AcademyLocations";

export default function JuniorProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 flex flex-col">
      <div className="max-w-[1800px] mx-auto px-4 py-8 flex-grow">
        {children}
      </div>
      <AcademyLocations />
    </div>
  );
}

