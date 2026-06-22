# Video File Editor Web

Video File Editor Web is the user-facing workspace for uploading, trimming, normalizing, merging, and downloading video files.

## What users can do

- Upload one clip or a full batch into one workspace
- Review duration, resolution, size, and codec details before export
- Trim a clip to an exact time range
- Normalize clips when merge is blocked by mismatched formats
- Merge prepared clips into one final video
- Download finished results and remove files that are no longer needed

## Recommended user flow

1. Upload your source clips.
2. Review the file details shown in the asset list.
3. Trim any clip that needs a shorter export.
4. If merge is blocked, run `Normalize for merge` with the preset that fits your goal.
5. Merge the prepared clips.
6. Download the finished result from the processing history.

## Normalize presets

- `Default 720p`: a stable all-purpose output size
- `Match largest clip`: keeps the biggest selected frame
- `Match smallest clip`: reduces everything to the smallest selected frame
- `Match average size`: chooses a middle-ground canvas from the selected clips

## Documentation

- In the app: open `/docs`
- From the main screen: use the `Read documentation` button or the top `Docs` link

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create `.env.local` when you want the frontend to talk to a deployed or local backend:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4001
```

## Notes

- The interface is written for end users first, while deeper implementation details live in the backend repo and project documentation.
- The Next.js development indicator is disabled in `next.config.ts` so local review stays closer to the real product UI.
