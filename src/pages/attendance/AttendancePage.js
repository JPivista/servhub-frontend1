import GlassPanel, { PageIntro } from "../../components/ui/GlassPanel";

export default function AttendancePage() {
  return (
    <div className="space-y-5">
      <PageIntro kicker="People" title="Attendance" />
      <GlassPanel as="article" className="p-8 text-center">
        <p className="text-lg font-semibold">We are working on it</p>
        <p className="mt-2 text-sm text-white/55">
          Attendance tracking is under construction and will be available soon.
        </p>
      </GlassPanel>
    </div>
  );
}
