# FindIt frontend

This folder contains the React 19 and Vite frontend for FindIt. The application reads and writes listings, accounts, saved items, matches, and claims through the Express API in the backend folder.

For the full project setup, MongoDB configuration, VS Code tasks, and final demonstration flow, see the project-root README.md and PRESENTATION_GUIDE.md.

## Run the frontend

From the project root:

~~~powershell
npm.cmd run dev
~~~

Vite normally serves the app at http://localhost:5173/ and proxies /api requests to the backend on port 5000.

## Checks

~~~powershell
npm.cmd run lint
npm.cmd run build
~~~