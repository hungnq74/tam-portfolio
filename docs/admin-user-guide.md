# Portfolio Admin User Guide

This guide is for non-technical users who update proposal-style portfolio projects, using the AXE project as the standard.

Admin now manages only `Thinking` proposal projects. Writing/custom projects can still appear on the public portfolio, but they are not edited in this admin tool.

## What You Can Edit

Admin edits these English project parts:

- Project ID
- Project title
- Text summary
- Overview
- Cover image
- Main image
- CTA button label
- Proposal PDF carousel
- Credit intro
- Collaborator name chips

Admin does not edit field, year, category, client, scope, objective, solution, results, thumbnail placement, site copy, homepage cover, or custom Writing project sections.

## Login

Open:

```text
/admin/login
```

Then enter the admin username and password, and click `Sign in`.

After login, the project list is at:

```text
/admin
```

## Project List

The list shows only editable proposal-style Thinking projects.

Each project row includes:

- Cover preview
- Media status
- English title
- `Edit`
- `Delete`

Use `New project` to create a new proposal project.

## Editing A Project

1. Open `/admin`.
2. Click `Edit`.
3. Work through the three tabs:
   - `Content`
   - `Media`
   - `CTA & Credits`
4. Click `Save project`.
5. Wait for the success message.
6. Check the public page at `/work/project-id`.

Example:

```text
/work/axe
```

## Content Tab

The `Content` tab controls the text shown near the top of the project page.

### Project ID

The project ID becomes the public URL.

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
- Do not use accent marks.
- Keep it short and stable.

After a project is created, the project ID cannot be changed in admin.

### Title

Use the project or campaign name.

### Summary

Use one short context sentence. This appears near the top of the detail page and should explain the project quickly.

Example:

```text
Context: Make AXE Vietnam the top #1 brand discussed by Gen Z on social media and distribute 2M product samples.
```

### Overview

Use a short paragraph with the broader project explanation. Keep it easy to scan.

## Media Tab

The `Media` tab controls the visual flow:

1. Cover image
2. Main image
3. Proposal PDF carousel

### Upload Cover Image

1. Click `Upload cover image`.
2. Choose PNG, JPG, JPEG, or WebP.
3. Wait until upload finishes.
4. Check the preview.

The cover image appears at the top of the public project page.

### Adjust Cover Crop

Use `Adjust cover crop` only when the cover preview cuts off an important part
of the image.

1. Try the quick position buttons first: `Center`, `Top`, `Bottom`, `Left`, or
   `Right`.
2. Check the crop preview beside the controls.
3. If the image still needs a small adjustment, use the two fine-tune sliders:
   `Move focus left or right` and `Move focus up or down`.

Tip: most covers should stay on `Center`.

### Upload Main Image

Upload the main image separately from the PDF.

This should be the hero summary image below the text summary/overview. For AXE, this is the image with the executive summary layout.

Important: uploading a PDF will not replace the main image.

### Upload Proposal PDF

1. Upload cover image first.
2. Upload main image.
3. Click `Upload proposal PDF`.
4. Choose a PDF file.
5. Wait while admin converts PDF pages into carousel images.
6. Check the slide count in the preview.
7. Save the project.

Save requires:

- Cover image
- Main image
- At least one proposal slide from PDF

## CTA & Credits Tab

This tab controls the bridge around the proposal carousel.

### CTA Button Label

The CTA button appears before the PDF carousel and scrolls down to the carousel.

Default label:

```text
View full portfolio
```

You can edit the wording if needed, but keep it short.

### Credit Intro

The credit intro appears after the PDF carousel.

Default copy:

```text
Shout out to the friends who built this proposal with me.
```

### Collaborator Names

Write one name per line, or separate names with commas.

Example:

```text
Minh Anh
Hoàng Linh
Bảo Trân
```

Admin will show these as small name chips on the public page.

## Creating A New Project

1. Click `New project`.
2. Fill `Project id`.
3. Fill title, summary, and overview.
4. Open `Media`.
5. Upload cover image.
6. Upload main image.
7. Upload proposal PDF.
8. Open `CTA & Credits`.
9. Review CTA labels, credit intros, and collaborator names.
10. Click `Save project`.
11. Open `/work/project-id` to review the public page.

## Good Review Checklist

Before finishing, check:

- Public page has the right title, summary, overview, CTA, and credit text.
- Cover is not awkwardly cropped.
- Main image appears below the text section.
- CTA appears before the PDF carousel.
- PDF carousel has all expected slides.
- Credit note and name chips appear after the carousel.
- Public URL works.

## Common Problems

### Save Button Is Disabled

Blob storage may not be configured. Ask a developer to check `BLOB_READ_WRITE_TOKEN`.

### Upload Main Image Is Disabled

Upload the cover image first.

### Upload Proposal PDF Is Disabled

Upload the cover image first.

### Save Fails With Missing Media

Make sure the project has all three required media pieces:

- Cover image
- Main image
- Proposal PDF slides

### The Public Page Still Shows Old Content

Refresh the public page. If it still looks old, save once more and ask a developer to check whether production needs redeploying.
