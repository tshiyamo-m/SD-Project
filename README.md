# U-Collab

[![codecov](https://codecov.io/gh/tshiyamo-m/SD-Project/branch/feature/research-postings/graph/badge.svg)](https://codecov.io/gh/tshiyamo-m/SD-Project)

A MERN stack university research collaboration platform...
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Setup
**Prerequisites**
- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- Git

**1. Clone the Repository**

### `git clone https://github.com/tshiyamo-m/SD-Project.git`

### `cd SD-Project`

**2. Install Dependencies**

In the project directory, you run:

### `npm install`

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Testing Commands
**Backend Test Coverage: `npx jest --coverage`**
Runs the Jest test suite for the backend and generates a coverage report.\
This will show:

- Which lines of code are covered by tests
- Percentage coverage for statements, branches, functions, and lines
- Uncovered lines that need test attention

The coverage report will be generated in the `coverage` directory.

**Frontend Tests: `npm run pages`**

Runs the frontend test suite for page components.\
This command is specifically configured to test React page components and their functionality.

## API Deployment (Render)
**Base URL:**
https://sd-project-qb1w.onrender.com .\
Our API uses POST requests only. Access via browser (GET) will show a basic confirmation message.

### Testing the API
**Required Headers**
Content-Type: application/json

**Sample Endpoints**
 1. Create a Project:\
    -Endpoint: https://sd-project-qb1w.onrender.com/api/Projects\
    -Method:POST\
    -Body:{\
          "owner":"sd",\
          "title": "sd",\
          "description": "sd",\
          "field": "sd",\
          "collaborators": [],\
          "requirements": "sd",\
          "fundingAmount": "sd",\
          "fundingSource": "sd",\
          "startDate": "sd",\
          "endDate": "sd",\
          "status": "Planning",\
          "tags":"sd",\
          "skills": "sd"\
        }
2. Create a Review:
    -Endpoint: https://sd-project-qb1w.onrender.com/api/Review
    -Method:POST
    -Body:{
          "projectId" : "683360dc2d00546b91095834",
          "reviewerId" : "6831e900dbc3b0464f54d42a",
          "rating:" : 5,
          "comment" : "Top Project of the year",
          "date" : "2025-05-24",
          "type" : "reviewer"
          }

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
