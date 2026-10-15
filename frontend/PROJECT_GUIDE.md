# FindIt frontend: presentation notes

## What the app does

FindIt helps students report lost belongings, post items they have found, and search by item name, location, report type, or category.

## Main files

- `src/App.jsx` shows the main page and keeps the current page, searches, filters, and saved items.
- `src/data/listings.js` contains the starting item examples and category names.
- `src/components/ListingCard.jsx` displays one lost-or-found item card.
- `src/components/ReportModal.jsx` collects a report and shows a selected photo before adding it to the page.
- `src/components/LoginPage.jsx` contains the sign-in form.
- `src/components/RegisterPage.jsx` contains the student registration form.
- `src/components/ItemDetailModal.jsx` shows details for one selected item.
- `src/App.css` and `src/components/auth.css` style the website and account pages.

## Simple explanation of how it works

React `useState` stores values while the page is open. For example, `items` stores the visible listings and `query` stores what was typed into search. When a value changes, React redraws the page.

The item search uses a regular `for` loop. It checks each item against the selected type, category, words, and location, then adds matches to a new list.

The report form reads its fields, creates one item object, and adds that item to the top of the current list. The photo is read by the browser so a picture can be shown with the new item.

## Current project limit

The current backend only has a health route. Account verification, permanent listing storage, and photo storage still need backend endpoints. The `@college.edu` rule checks the email format in the browser; it does not prove that an email address or college ID belongs to a real student.
