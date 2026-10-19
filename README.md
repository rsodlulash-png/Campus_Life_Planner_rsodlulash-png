# Witswatersrand University Campus Life Planner

**Theme: Conquer the Edge**

## 1. Project Overview

A responsive, vanilla HTML/CSS/JavaScript planner for The Witwatersrand University students to organise assignments, campus events and personal commitments.

University life can involve lectures, assignments, examinations, events, and other responsibilities. Keeping track of everything can become challenging. This project aims to provide a central place where students can organise tasks, plan their schedules, access useful resources, and manage their preferences.

The application follows the theme **“Conquer the Edge,”** reflecting the determination, ambition, and resilience of Wits students.

## 2. Problem Statement

University students often manage several academic deadlines and personal commitments at the same time. Without an organised planning system, they may struggle to prioritise tasks, remember deadlines, and balance their responsibilities.

The Wits Campus Life Planner aims to address this challenge by providing a simple, accessible, and student-friendly planning experience.

**Brand note:** This is an independent student project, not an official University of the Witwatersrand service. The palette is inspired by Wits colours. The Witwatersrand University Logo was linked inside of the 'index.html'file and all html file using the image tag.

## 3. Project Objectives

The objectives of the project are to:

- Help students organise academic tasks and deadlines.
- Provide a central dashboard for navigating planner features.
- Support the organisation of timetables and campus activities.
- Provide access to useful student resources.
- Validate user input to reduce invalid or incomplete information.
- Encourage better planning, time management, and student productivity.

## 4. Target Users

The primary target users are students studying at the University of the Witwatersrand (Wits), including students who need help managing assignments, deadlines, study sessions, and campus activities.

## 5. Technologies Used

- **HTML:** Structures the web pages using semantic HTML elements.
- **CSS:** Provides the visual design, layout, responsive styling, and interaction feedback.
- **JavaScript:** Handles application logic, form validation, user interactions, and planner functionality.
- **JSON:** Stores sample planner data in a structured format.
- **Git and GitHub:** Support version control, collaboration, and project hosting.
- **Visual Studio Code:** Used for development and debugging.
- **Live Server:** Used to run and test the website locally during development.

## 6. Project Structure

The project is organised into the following files and directories:

Test/
├── index.html
├── test.html
├── style.css
├── seed.json
|-- .gitgnore
├── README.md
├── scripts/
│   ├── main.js
│   ├── storage.js
│   ├── search.js
│   ├── ui.js
│   ├── validators.js
│   └── tests.js
└── pages/
    ├── dashboard.html
    ├── tasks.html
    ├── timetable.html
    ├── resources.html
    └── settings.html

### File descriptions

- `index.html` — Main entry page for the application.
- `test.html` — Page for demonstrating and testing input validation.
- `style.css` — Shared styling for the application.
- `seed.json` — Sample data used to initialise or demonstrate planner records.
- `scripts/main.js` — Main JavaScript entry point.
- `scripts/storage.js` — Module for handling planner data storage.
- `scripts/search.js` — Module for search-related functionality.
- `scripts/ui.js` — Module for user interface interactions.
- `scripts/validators.js` — Validation rules for planner inputs.
- `scripts/tests.js` — Automated validation tests.
- `pages/dashboard.html` — Dashboard page.
- `pages/tasks.html` — Task management page.
- `pages/timetable.html` — Timetable page.
- `pages/resources.html` — Student resources page.
- `pages/settings.html` — Application settings page.

## 7. Main Features

The application is designed around the following features:

### Dashboard

Provides a central point from which students can navigate the planner and access the main sections of the application.

### Task Management

Supports organising academic tasks and recording information such as:

- Task title
- Due date
- Estimated duration
- Category or tag

### Timetable

Provides a dedicated section for organising and reviewing scheduled academic activities.

### Student Resources

Provides a dedicated area for useful student information and resources.

### Settings

Provides a section for application preferences.

### Navigation and Keyboard Accessibility

The planner can be used entirely with a keyboard.

**Skip link:** Pressing `Tab` on page load reveals a "Skip to main content" link. Pressing `Enter` moves focus past the navigation to the main content.
**Consistent navigation:** Every page has the same main navigation (Home, Dashboard, Tasks, Events & Timetable, Resources, Settings), and the current page is marked with `aria-current="page"`.
**Standard keys:** `Tab` and `Shift + Tab` move between links, fields and buttons. `Enter` follows links and submits forms. `Space` activates buttons and checkboxes.
**Visible focus:** The element that has keyboard focus is always outlined.
**Form errors:** When a form is submitted with invalid data, an error message appears under each invalid field, the field is marked `aria-invalid`, and focus moves to the first invalid field.
**Editing and deleting:** Choosing Edit moves focus to the title field. Choosing Delete asks for confirmation before anything is removed.

### Import and Export

Planner data can be backed up and restored as a JSON file.

 **Export:** On the Settings page, choose **Export planner**. The browser downloads `seed.json`, which contains the saved tasks, events, settings and tags.
**Import:** On the Settings page, choose a backup file with **Import planner**. The app asks for confirmation, because importing **replaces** the current saved planner data.
 **Error handling:** A file that is not valid JSON is rejected with the message "The selected file is not valid JSON." A file with valid JSON but an invalid structure or invalid records is rejected with an explanatory message, and the existing data is left unchanged.
 **Round trip:** Exporting and then importing the same file should restore the planner to the same state.

### Input Validation

The validation module checks planner information before it is accepted. Its rules include:

- Titles must contain between 3 and 120 characters.
- Dates must follow the expected format and represent valid calendar dates.
- Durations must be whole numbers between 1 and 1,440 minutes.
- Tags must contain between 2 and 40 characters and use permitted characters.
- Invalid entries should produce clear error messages.

### Sample Data

The `seed.json` file contains sample planner records that can be used to demonstrate and test the application.

*Note: The availability and completeness of individual features depend on their current implementation and testing status.*

## 8. Installation and Setup

### Prerequisites

Before running the project, make sure you have:

- Git installed.
- Visual Studio Code or another code editor.
- A modern web browser.
- The Live Server extension for Visual Studio Code.

### Step 1: Clone the repository

git clone https://github.com/USERNAME/Campus_Life_Planner_rsodlulash-png.git

### Step 2: Open the project

Open the downloaded project folder in Visual Studio Code.

### Step 3: Run the application

Open `index.html` and use **Open with Live Server**.

The application should open in your default browser.

Because the project uses JavaScript modules and fetch-based resources, running it through a local development server is recommended instead of opening the HTML file directly.
python3 -m http.server 5500

OR 

Open https://rsodlulash-png.github.io/Campus_Life_Planner_rsodlulash-png/

## 9. Testing

Testing helps ensure that the application behaves correctly and handles invalid user input appropriately.

https://rsodlulash-png.github.io/Campus_Life_Planner_rsodlulash-png/test.html

### Manual testing

The following areas should be checked:

- Navigation between the main pages.
- Display and layout of the dashboard.
- Task form submission.
- Validation of titles, dates, durations, and tags.
- Display of validation errors.
- Search functionality, where implemented.
- Data persistence, where implemented.
- Layout on different screen sizes.
- Keyboard-only navigation.
- Visible focus indicators and readable error messages.

### Automated validation tests

The "scripts/tests.js` module is intended to test the validation functions in `scripts/validators.js`.

To run the tests:

1. Start the project with Live Server.
2. Open `test.html`(http://127.0.0.1:5500/test.html) in the browser.
3. Use the test controls provided by the page.
4. Review the displayed test results.
5. Fix any failing tests and run them again.

Only report tests as passed after they have actually been executed successfully.

## 10. Accessibility and Usability

Accessibility is an important part of the project's design and evaluation.

The following practices should be implemented and verified:

- **Semantic HTML:** Use appropriate elements such as `header`, `nav`, `main`, `section`, `form`, and `footer`.
- **Keyboard accessibility:** Ensure that interactive controls can be reached and operated using a keyboard.
- **Visible focus:** Provide a clear visual indicator for the element currently receiving keyboard focus.
- **Form labels:** Give each input a meaningful, programmatically associated label.
- **Error messages:** Explain invalid input clearly and associate relevant messages with their fields.
- **Colour contrast:** Use readable text and sufficient contrast between foreground and background colours.
- **Responsive design:** Check that the layout remains usable on mobile devices and larger screens.
- **Reduced motion:** Respect the user's `prefers-reduced-motion` preference when using animations.
- **Clear navigation:** Use descriptive link text and consistent navigation patterns.

Accessibility must be checked in the running application rather than assumed from the presence of these requirements in the README.

## 11. Design and User Experience

The application uses the “Conquer the Edge” theme to reflect the identity and ambitions of Wits students.

The design aims to provide:

- A clear page hierarchy.
- Consistent navigation.
- Readable typography.
- A clean and organised layout.
- Helpful feedback when users interact with forms.
- A responsive experience across devices.

## 12. Known Limitations

The following limitations should be reviewed and updated as development progresses:

- The application may initially use sample data rather than a live backend.
- Features that require a server, authentication, or a database may not be available.
- Data persistence depends on the storage method implemented.
- The timetable and resources sections may require further development to meet all student needs.
- Accessibility and browser compatibility require practical testing.

Update this section to reflect the limitations that remain in the final version.

## 13. Future Improvements

Potential improvements include:

- Notifications and reminders for upcoming deadlines.
- Improved timetable and calendar views.
- More advanced task filtering and search.
- Additional student resources and campus information.
- More comprehensive automated tests.
- Integration with university calendars, where feasible.
- Enhanced mobile usability.
- Secure user accounts and synchronisation, if a backend is introduced.

## 14. Demonstration

A short project demonstration should show: https://drive.google.com/file/d/1M1yTqhXvXv6k8iXdWo6qD6bI0vZ1EA4N/view?usp=sharing



## 15. Author and Project Information

**Project:** Wits Campus Life Planner  
**Institution:** African Leadership University, Rwanda 
**Theme:** Conquer the Edge  
1. The home page and overall design.
2. Keyboard navigation: the skip link, tabbing through the navigation, and visible focus.
3. Task entry and validation, including regex edge cases.
4. The automated validation test results on `test.html`.
5. Import and export of planner data, using the sample records in `seed.json`.
6. Responsive layout at mobile, tablet and desktop widths.
7. The current limitations and possible future improvements.
**Project type:** Student productivity web application  
**Status:** In development

## 16. Conclusion

The Wits Campus Life Planner aims to make academic organisation easier for Wits students by bringing important planning activities together in one place.

By focusing on usability, validation, accessibility, and a student-centred design, the project aims to help students manage their responsibilities and make the most of their university experience.


**Conquer the Edge — plan with purpose, stay organised, and make every opportunity count.**
