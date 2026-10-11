# EduTrack: Student Management System

A responsive web app for managing student records, built with plain HTML, CSS and JavaScript. It was made as a Full Stack Development internship task (Task 4: Student Management System).

## Features

- **Add, edit and delete students** (full CRUD), with a confirmation step before deleting
- **Form validation**: required fields, valid email and phone, score between 0 and 100, and no duplicate roll numbers
- **Search** by name, roll number, email or phone
- **Filter by class** and **sort** by name, roll number, score or recently added
- **Pagination**: 8 students per page
- **Dashboard stats**: total students, number of classes, average score and top scorer
- **Export to CSV**: downloads the current filtered list (opens in Excel or Google Sheets)
- **Saved data**: records stay after a page refresh
- **Responsive**: the table turns into cards on phones
- **Accessible**: keyboard navigation, focus outlines, ARIA labels, Escape closes pop-ups

## How to run

No installation needed.

1. Keep all three files in one folder: `index.html`, `style.css`, `app.js`.
2. Double-click `index.html` to open it in your browser.

The app starts with 10 demo students. Use "Reset demo data" in the footer to restore them at any time.

## Project structure

| File | Purpose |
|------|---------|
| `index.html` | Page structure: header, stats, toolbar, table, add/edit and delete pop-ups |
| `style.css` | Styling and responsive rules |
| `app.js` | Data handling, validation, search, sorting, pagination, CSV export |

## Data storage

Records are saved in the browser's `localStorage` under the key `edutrack.students.v1`, so each browser keeps its own data. Each student has: `id`, `roll`, `name`, `gender`, `className`, `email`, `phone`, `score` and `added`.

## Notes

- This is a front-end project: the data lives in the browser and is not shared between devices.
- A production version would store records on a server with a database such as SQLite or MongoDB, with the front end calling it through a REST API.
- CSV export neutralises cells that start with `=`, `+`, `-` or `@` to prevent spreadsheet formula injection.
