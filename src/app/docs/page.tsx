import Link from "next/link";

const featureCards = [
  {
    title: "Upload and organize",
    description:
      "Bring clips into one workspace, review their names, sizes, durations, and resolutions, and keep uploads easy to find.",
  },
  {
    title: "Trim with precision",
    description:
      "Choose one source clip, set start and end points, and export a shorter version for highlights, intros, or cleanup.",
  },
  {
    title: "Normalize before merge",
    description:
      "When clips use different resolutions or formats, normalize them to one target canvas so merge stays reliable.",
  },
  {
    title: "Merge and download",
    description:
      "Combine prepared clips into one final export, follow the progress, and download the completed result when processing finishes.",
  },
];

const normalizeOptions = [
  {
    title: "Default 720p",
    description:
      "A safe preset when you want a predictable output size for social posts, demos, or general delivery.",
  },
  {
    title: "Match largest clip",
    description:
      "Best when you want to preserve the biggest selected frame and lift smaller clips into the same canvas.",
  },
  {
    title: "Match smallest clip",
    description:
      "Best when you want to reduce final output size and keep every clip aligned to the smallest selected frame.",
  },
  {
    title: "Match average size",
    description:
      "A balanced option when you want a middle ground between larger and smaller source clips.",
  },
];

const statusItems = [
  {
    label: "Queued",
    description: "Your request is saved and waiting its turn.",
  },
  {
    label: "Processing",
    description: "The export is running right now.",
  },
  {
    label: "Completed",
    description: "The result is ready to download from the processing history.",
  },
  {
    label: "Failed",
    description: "The request could not finish and needs a retry or different input settings.",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Documentation
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
          A quick guide for uploading, preparing, merging, and downloading video files.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          This guide focuses on what the editor helps you do and how to move through the workflow with less trial and error.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Open workspace
          </Link>
          <a
            href="https://github.com/AndriiDobronos/Video-file-editor-web"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-panel-border bg-white/80 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Open README on GitHub
          </a>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {featureCards.map((item) => (
          <article key={item.title} className="glass-panel rounded-[2rem] p-6">
            <h2 className="text-2xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Recommended flow
        </p>
        <ol className="mt-5 grid gap-4">
          <li className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-semibold text-foreground">1. Upload your source clips.</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Start with the files you want to trim, compare, or merge later.
            </p>
          </li>
          <li className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-semibold text-foreground">2. Review duration, size, and resolution.</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              These details help you decide whether the clips can merge directly or should be normalized first.
            </p>
          </li>
          <li className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-semibold text-foreground">3. Trim or normalize as needed.</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use trim to cut a single clip. Use normalize when merge is blocked because the selected clips do not match.
            </p>
          </li>
          <li className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-semibold text-foreground">4. Merge prepared clips.</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              After clips share the same merge-ready format, create one final export.
            </p>
          </li>
          <li className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-semibold text-foreground">5. Download or remove finished assets.</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Keep only the files you still need and delete old assets when the workspace gets crowded.
            </p>
          </li>
        </ol>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
            Normalize presets
          </p>
          <div className="mt-5 grid gap-4">
            {normalizeOptions.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] bg-white/78 p-5">
                <p className="text-base font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
            Job statuses
          </p>
          <div className="mt-5 grid gap-4">
            {statusItems.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] bg-white/78 p-5">
                <p className="text-base font-semibold text-foreground">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
