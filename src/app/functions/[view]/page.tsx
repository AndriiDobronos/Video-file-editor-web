import { notFound } from "next/navigation";
import { EditorDashboard } from "@/components/editor-dashboard";
import { getFunctionViewFromSlug } from "@/lib/function-routes";

export async function generateStaticParams() {
  return [
    { view: "trim" },
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
