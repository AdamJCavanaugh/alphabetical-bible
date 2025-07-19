# AlphabeticalBible – Bible Reading Plan

This project provides a web-based, interactive Bible reading plan that guides you through the entire Protestant Bible in one year. The plan is grouped into 365 daily readings, with each day linking directly to the selected passage on Bible Gateway in your preferred translation.

## Features

- **365-Day Reading Plan:** Read through the whole Bible in one year, grouped into daily assignments.
- **Translation Selector:** Choose from CSB, KJV, NKJV, NIV, ESV, or NASB. Your choice is remembered for future visits.
- **Progress Tracking:** As you visit each day's reading, a check mark appears to show completion. Your progress is saved in your browser.
- **Collapsible Groups:** Days are grouped in blocks of 10 for easy navigation. The group containing your next unread day is automatically expanded.
- **Responsive Design:** Clean, simple interface that works on desktop and mobile.

## Project Structure

``` text
AlphabeticalBible/
├── src/
│   ├── data/
│   │   ├── books.csv              # List of Bible books and chapter counts
│   │   ├── reading-plan.json      # Generated 365-day reading plan
│   │   └── generate_reading_plan.py # Script to generate reading-plan.json from books.csv
│   ├── scripts/
│   │   └── app.js                 # Main JavaScript for UI and logic
│   ├── styles/
│   │   └── style.css              # CSS styles
│   └── index.html                 # Main HTML file
└── README.md                      # This file
```

## Getting Started

1. **Clone the Repository**

   ```sh
   git clone https://github.com/yourusername/AlphabeticalBible.git
   cd AlphabeticalBible
   ```

2. **Generate the Reading Plan (if needed)**
   If you modify `books.csv`, regenerate `reading-plan.json`:

   ```sh
   cd src/data
   python generate_reading_plan.py
   ```

3. **Open the App**
   Open `src/index.html` in your web browser.

## Usage

- **Select Your Translation:** Use the dropdown at the top to pick your preferred Bible translation.
- **Track Your Progress:** Click a day's link to mark it as completed (check mark appears). Progress is saved automatically.
- **Navigate Easily:** Only the group containing your next unread day is expanded by default. Expand/collapse other groups as needed.

## Customization

- **Change Book Order or Plan:** Edit `books.csv` and regenerate the plan.
- **Add More Translations:** Update the dropdown in `index.html` and adjust logic in `app.js` if needed.

## Deployment

You can deploy this project as a static site (e.g., GitHub Pages, Netlify, Vercel):

1. Push your code to your repository.
2. Serve the `src/` directory as your site root.

## License

MIT License

---

Enjoy your journey through the Bible!
