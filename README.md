<img width="230" height="110" alt="EduTrack Logo" src="https://github.com/user-attachments/assets/199eec51-4167-409d-ae25-d9cb265377d8" style="display: block; margin: 0 auto;"/>

# Overview
StudentTracker is a web app that serves as a centralized platform for teachers to track student results and maintain a student point system. The website is still in development and new features are still being added to make the website more interactive and engaging for young students. 
Features include:
*   Dashboard with important information such as number of students and pending assignments per class along with infographics and points leaderboards for each class
*   Maintain a list of classes with students classified accordingly for each class
*   Assignments tab to add assignments for classes and to upload grades and completion status for the assignments   (Able to add the same assignment for multiple classes)
*   ClassPoints tab to track the points for all students in each class
*   Exams tab to track examination results for students across the different examinations they undergo (Upon clicking student name, you will be able to see their performance over time)

## Background
I created this project as a favour to a relative working as an educator who wanted a way to track their students' results and establish a point system for their class. Personally, this project allowed me to experiment with using the Next.js framework, working with Supabase databases and learning how to establish an authentication system using Supabase. 

**Future Features**
*   Upload necessary student details using import function to prevent endless manual labour by users
*   Enhance the visuals for application to make it more interactive and engaging for younger students
*   Improve navigation of the website through teh dashboard (Onclick of specific boxes: Bring user directly to   relevant tab)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
*   Node.js (v18 or later recommended)
*   npm, yarn, pnpm, or bun

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/StudentTracker.git
    cd StudentTracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

4.  **Access the app:**
    Open http://localhost:3000 in your browser.

## Running Tests

*(If you have tests configured, describe how to run them here. Common commands are below)*

To run the test suite:

```bash
npm run test
# or
yarn test
```

## Technologies Used
*   Next.js - React Framework
*   React - UI Library
*   TypeScript - Static Typing

## Establish Supabase link and enable RLS for database tables along with creating policies to enable those who are authenticated to access and update the tables on Supabase

## Deploy on Vercel
