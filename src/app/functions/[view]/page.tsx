import { notFound } from "next/navigation";
import { EditorDashboard } from "@/components/editor-dashboard";
import { getFunctionViewFromSlug } from "@/lib/function-routes";

export async function generateStaticParams() {
  return [
    { view: "trim" },
    { view: "compress" },
    { view: "animation-export" },
    { view: "extract-frame" },
    { view: "extract-audio" },
    { view: "audio-track" },
    { view: "change-speed" },
    { view: "audio-volume" },
    { view: "text-overlay" },
    { view: "subtitle-burn-in" },
    { view: "transition-merge" },
    { view: "merge" },
    { view: "normalize" },
    { view: "crop-pad" },
    { view: "convert" },
  ];
}

export default async function FunctionPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  const activeView = getFunctionViewFromSlug(view);

  if (!activeView) {
    notFound();
  }

  return <EditorDashboard activeView={activeView} />;
}
