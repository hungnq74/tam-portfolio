# Portfolio Admin User Guide

This guide is for non-technical users who need to update portfolio project content. The admin tool is intentionally simple: it follows the same core field structure as the AXE sample project.

## 1. What Admin Can Edit

Admin can edit project records in English and Vietnamese.

Editable project content:

- Title
- Category
- Client
- Summary
- Scope
- Overview
- Objective
- Solution
- Results
- Year
- Field
- Thumbnail position
- Cover image
- Proposal PDF
- Cover focal point

Admin does not edit advanced/custom fields such as eyebrow labels, campaign title, closing note, naming rationale, media captions, CTA labels, homepage copy, cover artwork, field labels, or scope card labels.

If one of those advanced/custom items needs to change, ask a developer.

## 2. Login

Open:

```text
/admin/login
```

Then:

1. Enter the admin username.
2. Enter the admin password.
3. Click `Sign in`.

After login, you will see the project list at:

```text
/admin
```

The login session lasts about 8 hours.

## 3. Project List

The project list shows every project with:

- Thumbnail or cover preview.
- Field.
- Category.
- Year.
- Media status.
- English title.
- Vietnamese title.
- `Edit` button.
- `Delete` button.

Use `New project` to create a new project.

## 4. Editing A Project

1. Go to `/admin`.
2. Find the project.
3. Click `Edit`.
4. Review each tab:
   - `Overview`
   - `English`
   - `Vietnamese`
   - `Media`
5. Make your changes.
6. Click `Save project`.
7. Wait for the success message.
8. Check the public project page.

Public project pages use this format:

```text
/work/project-id
```

Example:

```text
/work/axe
```

## 5. Creating A New Project

1. Click `New project`.
2. Fill the `Overview` tab.
3. Fill the `English` tab.
4. Fill the `Vietnamese` tab.
5. Upload media if needed.
6. Click `Save project`.
7. Check the new public project page.

## 6. Overview Tab

The `Overview` tab contains shared settings.

### Project Id

The project id becomes part of the public URL.

Example:

```text
axe
```

Public URL:

```text
/work/axe
```

Rules:

- Use lowercase letters, numbers, and hyphens.
- Do not use spaces.
- Do not use Vietnamese accents.
- Keep it short.

Good examples:

```text
tesla-education
weshare
summer-campaign-2026
```

After a project is created, the project id cannot be edited in admin.

### Field

Choose where the project belongs:

- `Thinking in Systems`
- `Writing with Intent`

The selected field controls which categories are available in the English and Vietnamese tabs.

### Year

Shown on the public project page.

Examples:

```text
2024
2025
2024-2025
```

### Thumbnail Column And Row

These settings control fallback thumbnail placement for simple/text projects. For projects with cover media, the cover image is usually more important.

## 7. English Tab

Use this tab for English public content.

Fields:

- `Title`: project name.
- `Category`: project category/scope.
- `Client`: client or brand name.
- `Summary`: short description used in cards and previews.
- `Scope`: list of work areas.
- `Overview`: main context.
- `Objective`: goal or challenge.
- `Solution`: what was done.
- `Results`: list of outcomes.

### Scope And Results Format

Write one item per line:

```text
Big Idea
Campaign Proposal
Creative Copy
```

Comma-separated text also works, but one item per line is easier to review.

## 8. Vietnamese Tab

Use this tab for Vietnamese public content.

Fill the same structure as English:

- Title
- Category
- Client
- Summary
- Scope
- Overview
- Objective
- Solution
- Results

The Vietnamese copy does not need to be word-for-word translation. It should read naturally for Vietnamese readers while keeping the same project meaning.

## 9. Category

Choose from the dropdown. Do not type custom categories.

For Writing projects, examples include:

- Social Video Script
- Fanpage Always-on Content
- Website Content
- Social Outreach

For Vietnamese, choose the matching localized category from the Vietnamese dropdown.

Category affects where the project appears in content/gallery pages.

## 10. Media Tab

Use the `Media` tab for project files.

### Upload Cover Image

1. Open the `Media` tab.
2. Click `Upload cover image`.
3. Choose a PNG, JPG, JPEG, or WebP image.
4. Wait until upload completes.
5. Check the preview.

### Cover Focal Point

Use `Cover focal X` and `Cover focal Y` if the cover crop looks wrong.

- X controls left/right focus.
- Y controls top/bottom focus.
- 50/50 means center.

### Upload Proposal PDF

Upload proposal PDF when the project needs proposal slides.

Steps:

1. Upload cover image first.
2. Click `Upload proposal PDF`.
3. Choose a PDF.
4. Wait while admin converts pages into images.
5. Check that slide count appears.
6. Save the project.

Limits:

- Maximum 50 pages.
- Maximum 150 MB.

Do not close the tab while upload or PDF conversion is running.

## 11. Thinking Projects

Projects under `Thinking in Systems` need AXE-style media before saving:

- Cover image.
- Proposal PDF converted into slides.

If these are missing, admin will show an error asking you to upload cover and proposal.

## 12. Writing Projects

Projects under `Writing with Intent` can usually be saved without proposal slides.

Still, add a cover image when available because it improves the project card and detail page.

## 13. Saving

Click `Save project` after editing.

The save button may be disabled if:

- Blob storage is not configured.
- Upload is still running.
- Save is already running.
- There is a content manifest error.

Wait for `Project saved.` before leaving the page.

## 14. Verify After Saving

After saving, always check the public website.

Minimum checks:

1. Open `/work/project-id`.
2. Check English content.
3. Toggle Vietnamese.
4. Check Vietnamese content.
5. Check the project appears under the correct content category.
6. Check cover image crop on desktop and mobile if media changed.

Useful content pages:

```text
/content
/content/creative-copywriter
/content/creative-copywriter/scope/fanpage-always-on-content
/content/creative-copywriter/scope/website-content
```

## 15. Delete A Project

Use delete carefully.

Deleting removes the project from both English and Vietnamese.

Steps:

1. Go to `/admin`.
2. Find the project.
3. Click `Delete`.
4. Confirm only if you are sure.
5. Check the public site afterward.

If you only need to revise content, use `Edit` instead of delete.

## 16. Common Errors

### Missing Admin Env

Admin login is not configured. Ask a developer to check admin environment variables.

### Invalid Username Or Password

Check credentials and try again.

### Blob Token Missing

Admin can preview content but cannot save or upload. Ask a developer to configure Blob storage.

### Project Id Must Be A Lowercase Slug

Use only lowercase letters, numbers, and hyphens.

### Upload A Cover Image And Proposal PDF Before Saving This Thinking Project

The project is in `Thinking in Systems`, so it needs cover and proposal media.

### PDF Has Too Many Pages

The maximum is 50 pages. Shorten or split the PDF.

### PDF Is Larger Than 150 MB

Compress the PDF and upload again.

### Portfolio Content Changed In Another Tab

Someone else saved content after you opened the form.

Recommended fix:

1. Copy your unsaved text into a temporary note.
2. Refresh the admin page.
3. Reapply the changes.
4. Save again.

## 17. Best Practices

- Edit one project at a time.
- Avoid opening the same project in multiple admin tabs.
- Prepare long copy in a document before pasting into admin.
- Save after finishing one project.
- Always verify the public page after saving.
- Ask a developer for advanced/custom content changes.

## 18. Quick Rule

Use:

- `Overview` for shared project settings.
- `English` for English words.
- `Vietnamese` for Vietnamese words.
- `Media` for files.

Then click `Save project` and check the public website.
