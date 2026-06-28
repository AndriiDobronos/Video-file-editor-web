export type Locale = "en" | "uk";

export const DEFAULT_LOCALE: Locale = "en";
export const LANGUAGE_COOKIE_NAME = "vfe-locale";

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  uk: "UA",
};

export const localeNames: Record<Locale, string> = {
  en: "English",
  uk: "Українська",
};

export const intlLocales: Record<Locale, string> = {
  en: "en-US",
  uk: "uk-UA",
};

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "uk";
}

export const ukMessages: Record<string, string> = {
  "Video File Editor": "Редактор відеофайлів",
  Workspace: "Робочий простір",
  Function: "Функція",
  Jobs: "Завдання",
  Docs: "Документація",
  Functions: "Функції",
  Documentation: "Документація",
  Overview: "Огляд",
  Queue: "Черга",
  Shared: "Спільне",
  "Switch language": "Перемкнути мову",
  "Toggle description for {label}": "Показати або сховати опис для {label}",
  "Choose a page directly. Use the info button to open a short description without stretching the whole menu.":
    "Відкривайте потрібну сторінку напряму. Кнопка info показує короткий опис, не розтягуючи все меню.",
  "Use the shared workspace and jump straight to the right function page.":
    "Користуйтеся спільним робочим простором і одразу переходьте до потрібної функції.",
  "This guide focuses on what the editor helps you do, how the new page structure works, and how to move through each file task with less scrolling.":
    "Цей гід пояснює, що допомагає робити редактор, як працює нова структура сторінок і як виконувати завдання з файлами з меншим скролом.",
  "Open workspace": "Відкрити робочий простір",
  "Open README on GitHub": "Відкрити README на GitHub",
  "Upload once, reuse everywhere": "Завантажте один раз і використовуйте всюди",
  "Bring files into one shared workspace, then reuse the same uploads on trim, compress, frame extraction, text overlay, merge, normalize, crop/pad, convert, and jobs pages.":
    "Додавайте файли в один спільний робочий простір, а потім використовуйте ті самі завантаження для обрізання, стискання, витягування кадру, тексту, merge, normalize, crop/pad, convert і сторінки завдань.",
  "Dedicated function pages": "Окремі сторінки функцій",
  "Open only the tool you need instead of scrolling past unrelated controls. Each function now has its own route.":
    "Відкривайте лише той інструмент, який потрібен, замість прокрутки повз зайві контролери. Кожна функція тепер має свій маршрут.",
  "Normalize before merge": "Нормалізація перед merge",
  "When clips use different resolutions or formats, normalize them to one target canvas so merge stays reliable.":
    "Коли кліпи мають різні роздільності або формати, спочатку приведіть їх до однієї цільової канви, щоб merge працював стабільно.",
  "Add titles and captions": "Додавайте заголовки й підписи",
  "Use Text Overlay when you want to burn a heading, caption, or on-screen note straight into the exported video.":
    "Використовуйте Text Overlay, коли потрібно вшити заголовок, підпис або коротку примітку прямо в експортоване відео.",
  "Merge and download": "Склейте й завантажте",
  "Combine prepared clips into one final export, follow the progress, and download the completed result when processing finishes.":
    "Об’єднуйте підготовлені кліпи в один фінальний експорт, стежте за прогресом і завантажуйте результат після завершення обробки.",
  "Crop or expand the frame": "Обрізайте або розширюйте кадр",
  "Use Crop / Pad when you need to remove extra frame edges or place a video or supported image onto a larger canvas before the next step.":
    "Використовуйте Crop / Pad, коли потрібно прибрати зайві краї кадру або розмістити відео чи підтримуване зображення на більшій канві перед наступним кроком.",
  "Compress and capture previews": "Стискайте й створюйте прев’ю",
  "Compress one video with simple or advanced quality controls, extract still frames, and refresh preview thumbnails whenever you need a clearer reference.":
    "Стискайте відео простими або розширеними налаштуваннями якості, витягуйте статичні кадри та оновлюйте прев’ю, коли потрібен кращий орієнтир.",
  "Recommended flow": "Рекомендований сценарій",
  "1. Upload your source clips.": "1. Завантажте вихідні кліпи.",
  "Start with the files you want to trim, compare, merge, or convert later.":
    "Почніть із файлів, які плануєте обрізати, порівнювати, склеювати або конвертувати далі.",
  "2. Open the dedicated function page.": "2. Відкрийте сторінку потрібної функції.",
  "Use the top navigation to jump directly to Compress, Extract frame, Text Overlay, Trim, Merge, Normalize, Crop / Pad, Convert, or Jobs instead of working through one long page.":
    "Використовуйте верхню навігацію, щоб одразу перейти до Compress, Extract frame, Text Overlay, Trim, Merge, Normalize, Crop / Pad, Convert або Jobs, замість роботи з однією довгою сторінкою.",
  "3. Review file details and run the selected action.":
    "3. Перевірте деталі файла й запустіть вибрану дію.",
  "Use Compress to reduce file size, Extract frame for stills, Text Overlay for burned-in captions, Trim for one clip, Normalize when Merge reports mismatched clips, Crop / Pad to reshape the frame, or Convert when you need a new image format.":
    "Використовуйте Compress для зменшення розміру файла, Extract frame для статичних кадрів, Text Overlay для вшитих підписів, Trim для одного кліпа, Normalize коли Merge повідомляє про несумісність, Crop / Pad для зміни кадру або Convert для нового формату зображення.",
  "4. Merge or export prepared results.": "4. Склейте або експортуйте підготовлені результати.",
  "After clips share the same merge-ready format, create the final export or queue the conversion you need.":
    "Коли кліпи вже мають один merge-ready формат, створіть фінальний експорт або поставте потрібну конвертацію в чергу.",
  "5. Track jobs and download finished assets.":
    "5. Відстежуйте завдання й завантажуйте готові файли.",
  "Open the Jobs page to watch queue status, then keep only the files you still need in the shared asset library.":
    "Відкрийте сторінку Jobs, щоб стежити за станом черги, а потім залишайте у спільній бібліотеці лише потрібні файли.",
  "Normalize presets": "Пресети нормалізації",
  "Default 720p": "Стандарт 720p",
  "A safe preset when you want a predictable output size for social posts, demos, or general delivery.":
    "Надійний пресет, коли потрібен передбачуваний розмір результату для соцмереж, демо або звичайного експорту.",
  "Match largest clip": "Підігнати під найбільший кліп",
  "Best when you want to preserve the biggest selected frame and lift smaller clips into the same canvas.":
    "Найкраще підходить, коли хочете зберегти найбільший кадр і підтягнути менші кліпи до тієї ж канви.",
  "Match smallest clip": "Підігнати під найменший кліп",
  "Best when you want to reduce final output size and keep every clip aligned to the smallest selected frame.":
    "Найкраще підходить, коли хочете зменшити фінальний розмір і вирівняти всі кліпи під найменший вибраний кадр.",
  "Match average size": "Підігнати під середній розмір",
  "A balanced option when you want a middle ground between larger and smaller source clips.":
    "Збалансований варіант, коли потрібен компроміс між більшими й меншими вихідними кліпами.",
  "Job statuses": "Статуси завдань",
  Queued: "У черзі",
  "Your request is saved and waiting its turn.": "Ваш запит збережений і очікує своєї черги.",
  Processing: "Обробляється",
  "The export is running right now.": "Експорт виконується прямо зараз.",
  Completed: "Завершено",
  "The result is ready to download from the processing history.":
    "Результат готовий до завантаження з історії обробки.",
  Failed: "Помилка",
  "The request could not finish and needs a retry or different input settings.":
    "Запит не зміг завершитися і потребує повтору або інших вхідних налаштувань.",
  "Trim clip": "Обрізати кліп",
  "Cut one source clip to the exact moment range you need.":
    "Обрізайте один вихідний кліп до точного потрібного діапазону.",
  "Compress video": "Стиснути відео",
  "Reduce file size or transcode one video with simple presets or advanced quality controls.":
    "Зменшуйте розмір файла або перекодовуйте відео простими пресетами чи розширеним контролем якості.",
  "GIF / WebP export": "Експорт GIF / WebP",
  "Turn one short video moment into a lightweight GIF or animated WebP clip.":
    "Перетворюйте короткий момент відео на легкий GIF або анімований WebP.",
  "Extract frame": "Витягнути кадр",
  "Capture one still frame from a video and export it as PNG, JPEG, or WebP.":
    "Захоплюйте один статичний кадр з відео та експортуйте його як PNG, JPEG або WebP.",
  "Extract audio": "Витягнути аудіо",
  "Pull the audio track out of a video and export it as MP3, M4A, or WAV.":
    "Витягуйте аудіодоріжку з відео та експортуйте її як MP3, M4A або WAV.",
  "Mute / replace audio": "Заглушити / замінити аудіо",
  "Mute a video completely or replace its soundtrack with another uploaded audio source.":
    "Повністю вимикайте звук у відео або замінюйте доріжку іншим завантаженим аудіофайлом.",
  "Speed up / slow down": "Прискорити / сповільнити",
  "Adjust playback speed for a video or audio file while keeping the workflow export-ready.":
    "Змінюйте швидкість відтворення відео чи аудіо й одразу готуйте файл до експорту.",
  "Adjust audio volume": "Змінити гучність аудіо",
  "Raise, lower, or mute the soundtrack of a video or audio file with optional range control.":
    "Підвищуйте, знижуйте або вимикайте звук у відео чи аудіофайлі з опційним контролем діапазону.",
  "Add text overlay": "Додати текст поверх відео",
  "Burn one title, caption, or short note directly into a video export.":
    "Вшивайте заголовок, підпис або коротку примітку безпосередньо у відеоекспорт.",
  "Subtitle burn-in": "Вшивання субтитрів",
  "Import one .srt file and burn timed subtitles directly into a video export.":
    "Імпортуйте один .srt файл і вшивайте таймовані субтитри прямо у відеоекспорт.",
  "Transition merge": "Склейка з переходом",
  "Overlap two prepared clips and blend them together with a simple visual transition.":
    "Накладайте два підготовлені кліпи та змішуйте їх простим візуальним переходом.",
  "Merge clips": "Склеїти кліпи",
  "Combine prepared clips into one final export.":
    "Об’єднуйте підготовлені кліпи в один фінальний експорт.",
  "Normalize for merge": "Нормалізувати для merge",
  "Align mismatched clips to one merge-ready format.":
    "Приводьте несумісні кліпи до одного merge-ready формату.",
  "Crop / pad frame": "Crop / pad кадру",
  "Trim away frame edges or expand the canvas without changing clip order.":
    "Обрізайте краї кадру або розширюйте канву без зміни порядку кліпів.",
  "Convert image": "Конвертувати зображення",
  "Convert PNG, JPEG, and WebP files into another image format.":
    "Конвертуйте PNG, JPEG і WebP файли в інший формат зображення.",
  "Choose the next file action, upload new assets, and keep the shared library ready for every page.":
    "Обирайте наступну дію з файлом, завантажуйте нові assets і тримайте спільну бібліотеку готовою для кожної сторінки.",
  "Open one clip, set the exact start and end moment, and queue a clean trimmed export.":
    "Відкривайте один кліп, задавайте точний початок і кінець та ставте в чергу чистий обрізаний експорт.",
  "Shrink one video or transcode it to a cleaner MP4 export with preset or advanced quality controls.":
    "Зменшуйте одне відео або перекодовуйте його у чистіший MP4-експорт із пресетами чи розширеним контролем якості.",
  "Clip one short moment from a video and export it as a GIF or animated WebP preview.":
    "Вирізайте короткий момент з відео та експортуйте його як GIF або анімований WebP preview.",
  "Pick one moment in a clip and export that frame as a standalone image file.":
    "Обирайте конкретний момент у кліпі та експортуйте цей кадр як окремий файл зображення.",
  "Take the soundtrack out of a video and export it as a standalone audio file.":
    "Витягуйте звукову доріжку з відео та експортуйте її як окремий аудіофайл.",
  "Mute a video or replace its soundtrack with another uploaded audio source.":
    "Вимикайте звук у відео або замінюйте його доріжку іншим завантаженим аудіофайлом.",
  "Speed up or slow down a video or audio file while preparing a new export.":
    "Прискорюйте або сповільнюйте відео чи аудіофайл під час підготовки нового експорту.",
  "Raise, lower, or mute the soundtrack of one video or audio file with optional clipping protection and custom timing.":
    "Підвищуйте, знижуйте або вимикайте звук у відео чи аудіофайлі з опційним захистом від перевантаження та власними таймінгами.",
  "Add a burned-in title, caption, or note directly on top of one video export.":
    "Додавайте вшитий заголовок, підпис або примітку прямо поверх одного відеоекспорту.",
  "Import a timed .srt subtitle file, style the captions, and burn them directly into one video export.":
    "Імпортуйте таймований .srt файл, налаштовуйте стиль субтитрів і вшивайте їх прямо в один відеоекспорт.",
  "Overlap two prepared clips, blend the cut with a visual transition, and choose how the audio should behave in the handoff.":
    "Накладайте два підготовлені кліпи, змішуйте перехід візуальним ефектом і задавайте, як має поводитися аудіо в момент передачі.",
  "Pick multiple prepared clips, verify compatibility, and combine them into one final video.":
    "Обирайте кілька підготовлених кліпів, перевіряйте сумісність і об’єднуйте їх в одне фінальне відео.",
  "Bring selected clips to one shared format before merge so the export stays stable.":
    "Приводьте вибрані кліпи до одного спільного формату перед merge, щоб експорт залишався стабільним.",
  "Crop one frame tighter or pad it onto a larger canvas before the next export step.":
    "Обрізайте кадр щільніше або додавайте до нього канву більшого розміру перед наступним кроком експорту.",
  "Switch still images between PNG, JPEG, and WebP with optional resize and fit rules.":
    "Перемикайте статичні зображення між PNG, JPEG і WebP з опційними правилами розміру та fit.",
  "Watch processing status, review job history, and download finished outputs from one place.":
    "Відстежуйте статус обробки, переглядайте історію завдань і завантажуйте готові outputs з одного місця.",
  "Unknown size": "Невідомий розмір",
  "Unknown duration": "Невідома тривалість",
  "Unknown bitrate": "Невідомий бітрейт",
  "Unknown frame rate": "Невідома частота кадрів",
  Unknown: "Невідомо",
  Running: "Виконується",
  "Source file is no longer available in the shared library":
    "Вихідний файл більше недоступний у спільній бібліотеці",
  "{count} queued source files": "{count} вихідних файлів у черзі",
  "{name} +{count} more": "{name} + ще {count}",
  "Result ready": "Результат готовий",
  "Only video files are shown on this page because this function works with video sources.":
    "На цій сторінці показуються лише відеофайли, тому що ця функція працює з відеоджерелами.",
  "Visible videos": "Видимі відео",
  "Upload a video file to populate this page.": "Завантажте відеофайл, щоб заповнити цю сторінку.",
  "Videos with audio": "Відео з аудіо",
  "Only videos that already contain an audio stream stay visible here because Extract audio needs a soundtrack to pull out.":
    "Тут залишаються видимими лише відео, які вже містять аудіопотік, тому що Extract audio потребує доріжку для витягування.",
  "Upload a video with audio to populate this page.":
    "Завантажте відео з аудіо, щоб заповнити цю сторінку.",
  "Track-ready files": "Файли для роботи з доріжкою",
  "This page keeps video targets and audio-capable replacement files visible together so soundtrack editing stays focused.":
    "На цій сторінці разом видно цільові відео та файли заміни зі звуком, щоб редагування доріжки залишалося сфокусованим.",
  "Upload a video and at least one audio-capable file to populate this page.":
    "Завантажте відео й хоча б один файл зі звуком, щоб заповнити цю сторінку.",
  "Timed media": "Таймовані медіа",
  "Only video clips and audio files stay visible here because speed changes apply to time-based media only.":
    "Тут залишаються видимими лише відеокліпи та аудіофайли, тому що зміна швидкості застосовується лише до медіа з часом.",
  "Upload a video clip or audio file to populate this page.":
    "Завантажте відеокліп або аудіофайл, щоб заповнити цю сторінку.",
  "Audio-ready media": "Медіа зі звуком",
  "Only files that already contain an audio stream stay visible here because volume changes work on sound, not silent media.":
    "Тут залишаються видимими лише файли, які вже містять аудіопотік, тому що зміна гучності працює зі звуком, а не з тихими медіа.",
  "Upload a video or audio file that contains sound to populate this page.":
    "Завантажте відео- або аудіофайл, який містить звук, щоб заповнити цю сторінку.",
  "Visible images": "Видимі зображення",
  "Only still images are shown on this page because Convert works with image sources.":
    "На цій сторінці показуються лише статичні зображення, тому що Convert працює з image-джерелами.",
  "Upload a PNG, JPEG, or WebP file to populate this page.":
    "Завантажте PNG, JPEG або WebP файл, щоб заповнити цю сторінку.",
  "Crop / Pad ready": "Готово для Crop / Pad",
  "Crop / Pad accepts both video clips and supported still images, so both stay visible here.":
    "Crop / Pad приймає і відеокліпи, і підтримувані статичні зображення, тому обидва типи тут залишаються видимими.",
  "Upload a video or supported image file to populate this page.":
    "Завантажте відео або підтримуване зображення, щоб заповнити цю сторінку.",
  "Visible now": "Видимо зараз",
  "Showing every uploaded and generated file in the shared workspace.":
    "Показуються всі завантажені та згенеровані файли у спільному робочому просторі.",
  "Upload your first file to populate the shared library.":
    "Завантажте перший файл, щоб заповнити спільну бібліотеку.",
  "Upload files once, then open only the function page you need for the next step.":
    "Завантажте файли один раз, а потім відкривайте лише ту сторінку функції, яка потрібна на наступному кроці.",
  "Loading workspace": "Завантаження робочого простору",
  "Ready to edit": "Готово до редагування",
  "Needs attention": "Потребує уваги",
  "Syncing the latest files and queue history for this page.":
    "Синхронізуються останні файли та історія черги для цієї сторінки.",
  "Uploads and queue actions are available on every route.":
    "Завантаження та дії з чергою доступні на кожному маршруті.",
  "The editing service is taking longer than expected. Try Refresh again.":
    "Сервіс редагування відповідає довше, ніж очікувалося. Спробуйте Refresh ще раз.",
  syncing: "синхронізація",
  online: "онлайн",
  retry: "повтор",
  "Loading the shared library for this page...": "Завантажується спільна бібліотека для цієї сторінки...",
  "Current feedback": "Поточний фідбек",
  "Shared workspace notes": "Нотатки спільного робочого простору",
  "Upload media": "Завантаження медіа",
  "Add files once and use them on every function page":
    "Додайте файли один раз і використовуйте їх на кожній сторінці функцій",
  "No files selected yet.": "Файли ще не вибрані.",
  "Upload and probe metadata": "Завантажити й зчитати метадані",
  "Uploading...": "Завантаження...",
  "Refresh": "Оновити",
  "Refreshing...": "Оновлення...",
  "Shared asset library": "Спільна бібліотека файлів",
  "Uploads and generated outputs": "Завантаження та згенеровані результати",
  "All assets": "Усі файли",
  "Current outputs": "Поточні результати",
  "Loading details...": "Завантаження деталей...",
  Details: "Деталі",
  Download: "Завантажити",
  Delete: "Видалити",
  "Deleting...": "Видалення...",
  "Refreshing preview...": "Оновлення прев’ю...",
  "Regenerate preview": "Перегенерувати прев’ю",
  upload: "завантаження",
  output: "результат",
  local: "локально",
  "Workspace sync": "Синхронізація робочого простору",
  "Loading the latest files for this page": "Завантаження актуальних файлів для цієї сторінки",
  "Syncing uploaded assets and queue history.": "Синхронізація завантажених файлів та історії черги.",
  "Saved files and function-specific selections will appear here as soon as the shared workspace finishes loading.":
    "Збережені файли та вибір конкретної функції з’являться тут, щойно спільний робочий простір завершить завантаження.",
  "Function launcher": "Запуск функцій",
  "Choose one action and jump straight to it": "Оберіть одну дію й одразу перейдіть до неї",
  "Open jobs queue": "Відкрити чергу завдань",
  "Review processing history, track current jobs, and download finished results without leaving the shared upload space.":
    "Переглядайте історію обробки, стежте за поточними завданнями й завантажуйте готові результати, не покидаючи спільний простір завантажень.",
  "Open one function page and stay focused on that job.":
    "Відкрийте одну сторінку функції та зосередьтеся саме на цій задачі.",
  "Choose one file action, open the right page, and stay focused on that job only.":
    "Оберіть одну дію з файлом, відкрийте потрібну сторінку й працюйте лише з цією задачею.",
  "Workspace status": "Стан робочого простору",
  Assets: "Файли",
  Polling: "Опитування",
  Active: "Активне",
  Idle: "Неактивне",
  Trim: "Обрізання",
  Compress: "Стиснення",
  Animate: "Анімація",
  Frame: "Кадр",
  Audio: "Аудіо",
  Track: "Доріжка",
  Speed: "Швидкість",
  Volume: "Гучність",
  Text: "Текст",
  Subtitles: "Субтитри",
  Transition: "Перехід",
  Merge: "Склейка",
  Normalize: "Нормалізація",
  Convert: "Конвертація",
  "Crop/Pad": "Crop/Pad",
  "Animation export": "Експорт анімації",
  "Audio track": "Аудіодоріжка",
  "Change speed": "Зміна швидкості",
  "Audio volume": "Гучність аудіо",
  "Text overlay": "Текст поверх відео",
  "Crop / pad": "Crop / pad",
  "Shared uploads stay available on every function page":
    "Спільні завантаження доступні на кожній сторінці функцій",
  "Each tool now opens on its own route instead of one long scroll":
    "Кожен інструмент тепер відкривається на власному маршруті замість однієї довгої прокрутки",
  "Compress, extract, add text, crop, trim, convert, and merge all reuse the same shared asset library":
    "Compress, extract, add text, crop, trim, convert і merge використовують ту саму спільну бібліотеку файлів",
  "Preparing your workspace and loading the latest files.":
    "Підготовка робочого простору та завантаження актуальних файлів.",
  "Queue history": "Історія черги",
  "Queue history shows the processing requests you sent to the worker. The shared asset library below stores the uploaded source files and the generated outputs that came back after processing.":
    "Історія черги показує запити на обробку, які ви надсилали воркеру. Спільна бібліотека файлів нижче зберігає завантажені вихідні файли та згенеровані результати, що повернулися після обробки.",
  "Download result": "Завантажити результат",
  "Delete history": "Видалити з історії",
  "No jobs queued yet. Open one function page, queue work there, then return here to watch the history.":
    "У черзі ще немає завдань. Відкрийте сторінку функції, поставте там роботу в чергу, а потім поверніться сюди, щоб стежити за історією.",
  "Trim function": "Функція обрізання",
  "Cut one clip to the exact moment range": "Обріжте один кліп до точного діапазону",
  "Start time (seconds)": "Початковий час (секунди)",
  "End time (seconds)": "Кінцевий час (секунди)",
  "Queueing trim...": "Додавання обрізання в чергу...",
  "Queue trim job": "Додати обрізання в чергу",
  "Compress function": "Функція стиснення",
  "Shrink one video or transcode it into a cleaner export":
    "Стисніть одне відео або перекодуйте його в чистіший експорт",
  "Animation export function": "Функція експорту анімації",
  "Turn one short video moment into a GIF or animated WebP":
    "Перетворіть короткий момент відео на GIF або анімований WebP",
  "Extract frame function": "Функція витягування кадру",
  "Capture one still frame from a video clip":
    "Захопіть один статичний кадр із відеокліпу",
  "Extract audio function": "Функція витягування аудіо",
  "Pull the soundtrack out of one video clip":
    "Витягніть звукову доріжку з одного відеокліпу",
  "Audio track function": "Функція роботи з аудіодоріжкою",
  "Mute a video or replace its soundtrack":
    "Вимкніть звук у відео або замініть його доріжку",
  "Change speed function": "Функція зміни швидкості",
  "Speed up or slow down video and audio files":
    "Прискорюйте або сповільнюйте відео й аудіофайли",
  "Audio volume function": "Функція гучності аудіо",
  "Raise, lower, or mute the soundtrack":
    "Підвищуйте, знижуйте або вимикайте звукову доріжку",
  "Text overlay function": "Функція тексту поверх відео",
  "Burn one title or caption directly into a video":
    "Вшивайте один заголовок або підпис прямо у відео",
  "Subtitle burn-in function": "Функція вшивання субтитрів",
  "Import one .srt file and burn timed subtitles into a video":
    "Імпортуйте один .srt файл і вшивайте таймовані субтитри у відео",
  "Transition merge function": "Функція склейки з переходом",
  "Overlap two clips and blend the cut":
    "Накладіть два кліпи й змішайте перехід між ними",
  "Merge function": "Функція склейки",
  "Combine prepared clips into one final video":
    "Об’єднайте підготовлені кліпи в одне фінальне відео",
  "Normalize function": "Функція нормалізації",
  "Align clips before you merge them":
    "Вирівняйте кліпи перед склейкою",
  "Crop / pad function": "Функція crop / pad",
  "Tighten the frame or place it on a larger canvas":
    "Обріжте кадр щільніше або розмістіть його на більшій канві",
  "Convert function": "Функція конвертації",
  "Convert PNG, JPEG, and WebP files": "Конвертуйте PNG, JPEG і WebP файли",
  "Watch processing and download finished outputs":
    "Стежте за обробкою та завантажуйте готові результати",
  "Queue compress job": "Додати стиснення в чергу",
  "Queue GIF / WebP export job": "Додати експорт GIF / WebP у чергу",
  "Queue extract frame job": "Додати витягування кадру в чергу",
  "Queue extract audio job": "Додати витягування аудіо в чергу",
  "Queue audio track job": "Додати зміну аудіодоріжки в чергу",
  "Queue speed change job": "Додати зміну швидкості в чергу",
  "Queue audio volume job": "Додати зміну гучності в чергу",
  "Queue text overlay job": "Додати текст поверх відео в чергу",
  "Queue subtitle burn-in job": "Додати вшивання субтитрів у чергу",
  "Queue transition merge job": "Додати склейку з переходом у чергу",
  "Queue merge job": "Додати склейку в чергу",
  "Queue crop / pad job": "Додати crop / pad у чергу",
  "Queue convert job": "Додати конвертацію в чергу",
  "Queueing compression...": "Додавання стиснення в чергу...",
  "Queueing animation export...": "Додавання експорту анімації в чергу...",
  "Queueing frame extraction...": "Додавання витягування кадру в чергу...",
  "Queueing audio extraction...": "Додавання витягування аудіо в чергу...",
  "Queueing audio track edit...": "Додавання зміни аудіодоріжки в чергу...",
  "Queueing speed change...": "Додавання зміни швидкості в чергу...",
  "Queueing audio volume...": "Додавання зміни гучності в чергу...",
  "Queueing text overlay...": "Додавання тексту поверх відео в чергу...",
  "Queueing subtitle burn-in...": "Додавання вшивання субтитрів у чергу...",
  "Queueing transition merge...": "Додавання склейки з переходом у чергу...",
  "Queueing merge...": "Додавання склейки в чергу...",
  "Queueing normalize...": "Додавання нормалізації в чергу...",
  "Queueing crop / pad...": "Додавання crop / pad у чергу...",
  "Queueing convert...": "Додавання конвертації в чергу...",
  "Upload a video clip to enable trim.": "Завантажте відеокліп, щоб увімкнути обрізання.",
  "Upload a video clip to enable compression.":
    "Завантажте відеокліп, щоб увімкнути стиснення.",
  "Upload a video clip to enable GIF or animated WebP export.":
    "Завантажте відеокліп, щоб увімкнути експорт GIF або анімованого WebP.",
  "Upload a video clip to enable frame extraction.":
    "Завантажте відеокліп, щоб увімкнути витягування кадру.",
  "Upload a video that already contains audio to enable audio extraction.":
    "Завантажте відео, яке вже містить аудіо, щоб увімкнути витягування звуку.",
  "Upload a video clip to enable soundtrack editing.":
    "Завантажте відеокліп, щоб увімкнути редагування доріжки.",
  "Upload a video clip or audio file to enable playback speed changes.":
    "Завантажте відеокліп або аудіофайл, щоб увімкнути зміну швидкості відтворення.",
  "Upload a video or audio file with sound to enable audio volume adjustments.":
    "Завантажте відео або аудіофайл зі звуком, щоб увімкнути зміну гучності.",
  "Upload a video clip to enable text overlay.":
    "Завантажте відеокліп, щоб увімкнути текст поверх відео.",
  "Upload a video clip to enable subtitle burn-in.":
    "Завантажте відеокліп, щоб увімкнути вшивання субтитрів.",
  "Upload at least two video clips to enable transition merge.":
    "Завантажте щонайменше два відеокліпи, щоб увімкнути склейку з переходом.",
  "Upload at least two video clips to enable merge.":
    "Завантажте щонайменше два відеокліпи, щоб увімкнути склейку.",
  "Upload a video clip or supported image to enable crop / pad.":
    "Завантажте відеокліп або підтримуване зображення, щоб увімкнути crop / pad.",
  "Upload PNG, JPEG, or WebP files to enable image conversion.":
    "Завантажте PNG, JPEG або WebP файли, щоб увімкнути конвертацію зображень.",
  "Choose a preset workflow or tune compression settings yourself.":
    "Оберіть готовий сценарій або налаштуйте параметри стиснення вручну.",
  "Choose how aggressively the file should be compressed.":
    "Оберіть, наскільки агресивно слід стискати файл.",
  "Choose how the extracted soundtrack should be exported.":
    "Оберіть, як потрібно експортувати витягнуту звукову доріжку.",
  "Choose whether the next export should be silent or use a new soundtrack.":
    "Оберіть, чи має наступний експорт бути без звуку, чи з новою доріжкою.",
  "Choose how the selected clips should be aligned before merge.":
    "Оберіть, як вирівняти вибрані кліпи перед merge.",
  "Choose whether to remove frame edges or add canvas space.":
    "Оберіть, чи прибрати краї кадру, чи додати простір канви.",
  "Choose how one clip should hand off to the next.":
    "Оберіть, як один кліп має передаватися до наступного.",
  "Choose whether audio should fade together or switch abruptly.":
    "Оберіть, чи звук має плавно змішуватися, чи перемикатися різко.",
  "Choose a video": "Оберіть відео",
  "Choose audio": "Оберіть аудіо",
  "Choose media": "Оберіть медіа",
  "Choose an image": "Оберіть зображення",
  "Choose a file": "Оберіть файл",
  "Compression mode": "Режим стиснення",
  "Audio format": "Формат аудіо",
  "Audio mode": "Режим аудіо",
  "Video with audio": "Відео з аудіо",
  "Create a short looping preview clip from one video source.":
    "Створіть коротке зациклене прев’ю з одного відеоджерела.",
  "Simple": "Простий",
  "Advanced": "Розширений",
  "High quality": "Висока якість",
  "Small file": "Малий файл",
  "Very fast": "Дуже швидко",
  "Medium": "Середньо",
  "Slow": "Повільно",
  "Animated WebP": "Анімований WebP",
  "Contain": "Вписати",
  "Cover": "Заповнити",
  "Stretch": "Розтягнути",
  "Mute audio": "Вимкнути звук",
  "Replace audio": "Замінити звук",
  "Mute": "Вимкнути звук",
  "Crossfade": "Кросфейд",
  "Fade through black": "Згасання через чорний",
  "Crossfade audio": "Кросфейд аудіо",
  "Hard cut audio": "Різке перемикання аудіо",
  "Crop": "Обрізати",
  "Pad": "Додати поля",
  "Left": "Ліворуч",
  "Center": "По центру",
  "Right": "Праворуч",
  "Top": "Вгорі",
  "Bottom": "Внизу",
  "Bottom center": "Внизу по центру",
  "Bottom left": "Внизу ліворуч",
  "Bottom right": "Внизу праворуч",
  "Top center": "Вгорі по центру",
  "Pick a ready-made compression profile and export quickly.":
    "Оберіть готовий профіль стиснення і швидко експортуйте.",
  "Tune CRF, bitrate, and encoder preset yourself.":
    "Налаштуйте CRF, бітрейт і пресет енкодера вручну.",
  "Larger file, cleaner image, and safer detail retention.":
    "Більший файл, чистіше зображення та надійніше збереження деталей.",
  "A practical middle ground for everyday exports.":
    "Практичний баланс для щоденних експортів.",
  "Pushes file size lower when delivery weight matters most.":
    "Максимально зменшує розмір файла, коли вага найважливіша.",
  "Faster export time with slightly weaker compression efficiency.":
    "Швидший експорт із трохи слабшою ефективністю стиснення.",
  "A balanced default between speed and compression efficiency.":
    "Збалансований варіант між швидкістю та ефективністю стиснення.",
  "Takes longer but can squeeze file size down more effectively.":
    "Працює довше, але може ефективніше зменшити розмір файла.",
  "A widely supported looping preview that is easy to drop into chats and docs.":
    "Широко підтримуване зациклене прев’ю, яке легко використовувати в чатах і документах.",
  "A lighter modern preview format that usually stays smaller than GIF.":
    "Сучасний легший формат прев’ю, який зазвичай менший за GIF.",
  "Good for crisp graphics and transparent backgrounds.":
    "Добре підходить для чіткої графіки й прозорого фону.",
  "Best when you want a smaller photo-friendly output.":
    "Найкраще підходить, коли потрібен легший результат для фото.",
  "A modern web format with strong size savings.":
    "Сучасний вебформат із помітною економією розміру.",
  "Keep the full image inside the target area.":
    "Зберегти все зображення всередині цільової області.",
  "Fill the target area and crop the overflow.":
    "Заповнити цільову область і обрізати надлишок.",
  "Force the image to the exact size.":
    "Примусово підганяти зображення під точний розмір.",
  "A lightweight choice for voice tracks, music drafts, and general sharing.":
    "Легкий варіант для голосу, музичних чернеток і звичайного поширення.",
  "A clean AAC export that stays practical for modern apps and browsers.":
    "Чистий AAC-експорт, який зручно використовувати в сучасних застосунках і браузерах.",
  "A larger uncompressed output when you want easier handoff to audio tools.":
    "Більший нестиснений результат, коли потрібна зручніша передача в аудіоінструменти.",
  "Keep the picture and export the video without any soundtrack.":
    "Зберегти зображення й експортувати відео без жодної звукової доріжки.",
  "Swap the current soundtrack for another uploaded audio source.":
    "Замінити поточну звукову доріжку на інше завантажене аудіоджерело.",
  "Blend the outgoing clip directly into the incoming clip.":
    "Плавно змішати вихідний кліп із вхідним кліпом.",
  "Dip through black during the handoff for a more cinematic break.":
    "Провести перехід через чорний для більш кінематографічного розриву.",
  "Fade the outgoing soundtrack into the incoming one across the overlap.":
    "Плавно змішати вихідну доріжку з вхідною в зоні накладання.",
  "Switch the soundtrack at the transition point without fading the audio.":
    "Перемкнути доріжку в точці переходу без плавного згасання аудіо.",
  "Remove frame edges and keep only the selected inner area.":
    "Прибрати краї кадру й залишити лише вибрану внутрішню область.",
  "Place the source on a larger canvas without scaling it first.":
    "Розмістити джерело на більшій канві без попереднього масштабування.",
  "Import subtitle file (.srt)": "Імпортувати файл субтитрів (.srt)",
  "Imported SRT": "Імпортований SRT",
  "{count} subtitle cue detected": "Виявлено {count} репліку субтитрів",
  "{count} subtitle cues detected": "Виявлено {count} реплік субтитрів",
  "{count} cue{suffix} detected": "{count} cue{suffix} detected",
  "Clear SRT": "Очистити SRT",
  "Import one UTF-8 `.srt` file to load the subtitle timing and text.":
    "Імпортуйте один UTF-8 `.srt` файл, щоб завантажити таймінг і текст субтитрів.",
  "Imported .srt content will appear here.":
    "Тут з’явиться вміст імпортованого .srt файла.",
  "Subtitle preview": "Попередній перегляд субтитрів",
  "Font size": "Розмір шрифту",
  "Alignment": "Вирівнювання",
  "Font color": "Колір шрифту",
  "Outline color": "Колір обведення",
  "Distance from top or bottom edge": "Відстань від верхнього або нижнього краю",
  "Selected video": "Вибране відео",
  "Choose the video that should receive subtitles.":
    "Оберіть відео, у яке потрібно вшити субтитри.",
  "Burn-in summary": "Підсумок вшивання",
  "The `.srt` file controls when each subtitle appears. This page controls how the subtitles look in the final video export.":
    "Файл `.srt` керує тим, коли з’являється кожен субтитр. Ця сторінка керує тим, як субтитри виглядатимуть у фінальному відеоекспорті.",
  "Importing subtitles...": "Імпорт субтитрів...",
  "Clip A": "Кліп A",
  "Clip B": "Кліп B",
  "Swap order": "Поміняти порядок",
  "Choose the outgoing clip.": "Оберіть вихідний кліп.",
  "Choose the incoming clip.": "Оберіть вхідний кліп.",
  "Transition merge works best after the selected clips share one format.":
    "Склейка з переходом працює найкраще, коли вибрані кліпи мають один формат.",
  "Toggle transition merge details": "Показати або сховати деталі склейки з переходом",
  "Normalize the clips first so resolution, frame rate, and audio timing stay aligned during the overlap.":
    "Спочатку нормалізуйте кліпи, щоб роздільність, частота кадрів і таймінг аудіо залишалися вирівняними під час накладання.",
  "Open normalize page": "Відкрити сторінку нормалізації",
  "Visual transition": "Візуальний перехід",
  "Audio transition": "Аудіоперехід",
  "Overlap duration (seconds)": "Тривалість накладання (секунди)",
  "Output summary": "Підсумок результату",
  Tip: "Порада",
  "Use Audio Volume first if one clip sounds noticeably louder than the other.":
    "Спочатку скористайтеся Audio Volume, якщо один кліп звучить помітно голосніше за інший.",
  "Merge is blocked until the selected clips share one format.":
    "Склейка заблокована, доки вибрані кліпи не матимуть один формат.",
  "Toggle merge details": "Показати або сховати деталі склейки",
  "Open the dedicated Normalize page to align resolution, codecs, frame rate, and audio settings before merging.":
    "Відкрийте окрему сторінку Normalize, щоб вирівняти роздільність, кодеки, частоту кадрів і налаштування аудіо перед склейкою.",
  "Normalize selected clips": "Нормалізувати вибрані кліпи",
  "Output format": "Формат результату",
  "Fit mode": "Режим вписування",
  "Width (optional)": "Ширина (необов’язково)",
  "Height (optional)": "Висота (необов’язково)",
  "Quality (1-100)": "Якість (1-100)",
  "Background for JPEG or padded images": "Фон для JPEG або зображень із полями",
  Source: "Джерело",
  "Target summary": "Підсумок цілі",
  "Horizontal anchor": "Горизонтальна прив’язка",
  "Vertical anchor": "Вертикальна прив’язка",
  "Background color": "Колір фону",
  "Output rule": "Правило результату",
  "File type": "Тип файла",
  Video: "Відео",
  Image: "Зображення",
  Unavailable: "Недоступно",
  "Video outputs stay MP4/H.264/AAC, so width and height should use even numbers.":
    "Відеорезультати залишаються у форматі MP4/H.264/AAC, тому ширина й висота мають бути парними числами.",
  "Image outputs keep the original format. Use Convert when you also need PNG, JPEG, or WebP format switching.":
    "Результати для зображень зберігають оригінальний формат. Використовуйте Convert, коли також потрібно перемикати PNG, JPEG або WebP.",
  "Mute enabled": "Вимкнення звуку увімкнено",
  "Muted export": "Експорт без звуку",
  "Summary is unavailable.": "Короткий підсумок недоступний.",
  Selected: "Вибрано",
  preview: "прев’ю",
};
