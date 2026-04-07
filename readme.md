# EmoLab-AI Website

This site is a static website intended for GitHub Pages style hosting. Most content is maintained through JSON files under `info/` rather than by editing HTML directly.

## Structure

- `index.html`, `members.html`, `publications.html`, `datasets.html`, `projects.html`, `gallery.html`: page entry points
- `css/common.css`: shared styles for navigation, footer, layout, and shared controls
- `js/site.js`: shared navigation and footer renderer
- `js/*.js`: page-specific render logic
- `info/`: structured content data
- `scripts/preview.ps1`: local static preview helper

## Local preview

Run the local preview server from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\preview.ps1
```

Use a different port if needed:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\preview.ps1 -Port 4173
```

Then open `http://127.0.0.1:8000` or the port you selected.

## How to add a member

1. Open `info/members/info.json`.
2. Add a new object to the `members` array.
3. Required fields: `name`, `avatar`, `title`, `bio`, `links`, `introduction`.
4. Optional field: `googleScholar`.
5. If the avatar is a local image, place it under `info/members/img/` and reference it with a relative path like `info/members/img/your-photo.png`.
6. Supported `title` values currently map to page sections: `Leader`, `Ph.D`, `Master`, `Exchange`, `Others`.

## How to add a project

1. Open `info/projects/projects.json`.
2. Add a new object to the `projects` array.
3. Required fields: `name`, `description`, `url`, `status`, `tags`.
4. Supported `status` values currently used by the filter are `Active` and `Completed`.
5. Keep `tags` aligned with the filter buttons on `projects.html`, or update both together.

## How to add a publication

1. Open `info/publications/publications.json`.
2. Add a new object to the `publications` array.
3. Recommended fields: `year`, `date`, `title`, `authors`, `venue`, `links`, `type`, `abstract`, `description`.
4. `authors` should be an array of strings.
5. `links` can include `pdf`, `code`, `project`, and `video`.
6. `type` values are used to build the filter buttons automatically.
7. `description` is reused on the home page news feed.

## How to add a dataset

1. Open `info/datasets/datastes.json`.
2. Add a new object to the `datasets` array.
3. Recommended fields: `title`, `description`, `image`, `tags`, `stats`, `links`.
4. `stats` should be an array of `{ "label": "...", "value": "..." }` objects.
5. `tags` should match the visible filter buttons on `datasets.html` if you want filtering to work.

## How to add gallery items

1. Open `info/gallery/gallery.json`.
2. Add a new object to the `gallery` array.
3. Required fields: `category`, `date`, `title`, `description`, `image`.
4. Supported `category` values currently used by the filter are `Life`, `Events`, and `Awards`.
5. Place local images under `info/gallery/img/` and reference them with relative paths.

## Maintenance notes

- Use UTF-8 when editing files to avoid text corruption.
- Keep image and JSON paths relative, for example `info/gallery/img/example.jpg` instead of absolute `/info/...` paths.
- If you add new filter categories, update the corresponding buttons in the HTML page so the UI stays aligned with the data.
