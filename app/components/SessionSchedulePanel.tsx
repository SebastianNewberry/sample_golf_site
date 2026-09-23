import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

export function SessionSchedulePanel({
  children,
  footnote,
}: {
  children: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <div className="mt-6">
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Session Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">{children}</CardContent>
      </Card>
      {footnote}
    </div>
  );
}
