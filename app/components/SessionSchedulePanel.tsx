import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";
import { ContentFadeIn } from "@/app/components/ContentFadeIn";

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
        <CardContent className="p-0">
          <ContentFadeIn>{children}</ContentFadeIn>
        </CardContent>
      </Card>
      {footnote ? <ContentFadeIn>{footnote}</ContentFadeIn> : null}
    </div>
  );
}
