import Link from "next/link";

const featureCards = [
  {
    title: "Upload once, reuse everywhere",
    description:
      "Bring files into one shared workspace, then reuse the same uploads on trim, compress, frame extraction, text overlay, merge, normalize, crop/pad, convert, and jobs pages.",
  },
  {
    title: "Dedicated function pages",
    description:
      "Open only the tool you need instead of scrolling past unrelated controls. Each function now has its own route.",
  },
  {
    title: "Normalize before merge",
    description:
      "When clips use different resolutions or formats, normalize them to one target canvas so merge stays reliable.",
  },
  {
    title: "Add titles and captions",
    description:
      "Use Text Overlay when you want to burn a heading, caption, or on-screen note straight into the exported video.",
  },
  {
    title: "Merge and download",
    description:
      "Combine prepared clips into one final export, follow the progress, and download the completed result when processing finishes.",
  },
  {
    title: "Crop or expand the frame",
    description:
      "Use Crop / Pad when you need to remove extra frame edges or place a video or supported image onto a larger canvas before the next step.",
  },
  {
    title: "Compress and capture previews",
    description:
      "Compress one video with simple or advanced quality controls, extract still frames, and refresh preview thumbnails whenever you need a clearer reference.",
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-6 sm:gap-8 sm:px-8 lg:px-10">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Documentation
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Use the shared workspace and jump straight to the right function page.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-lg sm:leading-8">
          This guide focuses on what the editor helps you do, how the new page structure works, and how to move through each file task with less scrolling.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:px-5"
          >
            Open workspace
          </Link>
          <a
            href="https://github.com/AndriiDobronos/Video-file-editor-web"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-panel-border bg-white/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white sm:px-5"
          >
            Open README on GitHub
          </a>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {featureCards.map((item) => (
          <article key={item.title} className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <h2 className="text-xl font-semibold sm:text-2xl">{item.title}</h2>
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
              Start with the files you want to trim, compare, merge, or convert later.
            </p>
          </li>
          <li className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-semibold text-foreground">2. Open the dedicated function page.</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use the top navigation to jump directly to Compress, Extract frame, Text Overlay, Trim, Merge, Normalize, Crop / Pad, Convert, or Jobs instead of working through one long page.
            </p>
          </li>
          <li className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-semibold text-foreground">3. Review file details and run the selected action.</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use Compress to reduce file size, Extract frame for stills, Text Overlay for burned-in captions, Trim for one clip, Normalize when Merge reports mismatched clips, Crop / Pad to reshape the frame, or Convert when you need a new image format.
            </p>
          </li>
          <li className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-semibold text-foreground">4. Merge or export prepared results.</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              After clips share the same merge-ready format, create the final export or queue the conversion you need.
            </p>
          </li>
          <li className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-semibold text-foreground">5. Track jobs and download finished assets.</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Open the Jobs page to watch queue status, then keep only the files you still need in the shared asset library.
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
