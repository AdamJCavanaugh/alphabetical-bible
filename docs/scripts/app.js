// filepath: /bible-reading-plan/bible-reading-plan/src/scripts/app.js

document.addEventListener("DOMContentLoaded", function() {
    const readingPlanContainer = document.getElementById("reading-plan");
    const translationSelect = document.getElementById("translation-select");
    const readingMethodSelect = document.getElementById("reading-method-select");
    const readingPlans = {};
    let planData = [];

    // Load saved translation from localStorage, if any
    const savedTranslation = localStorage.getItem("bibleTranslation");
    if (savedTranslation) {
        translationSelect.value = savedTranslation;
    }

    const savedReadingMethod = localStorage.getItem("bibleReadingMethod");
    const readingMethodValues = Array.from(readingMethodSelect.options).map(option => option.value);
    if (readingMethodValues.includes(savedReadingMethod)) {
        readingMethodSelect.value = savedReadingMethod;
    }

    // Load completed days from localStorage
    const savedCompletedDaysByMethod = localStorage.getItem("completedDaysByMethod");
    const completedDaysByMethod = savedCompletedDaysByMethod
        ? JSON.parse(savedCompletedDaysByMethod)
        : { chapters: JSON.parse(localStorage.getItem("completedDays") || "[]") };
    let completedDays = completedDaysByMethod[readingMethodSelect.value] || [];

    function getFirstIncompleteDay() {
        for (let i = 1; i <= planData.length; i++) {
            if (!completedDays.includes(i)) {
                return i;
            }
        }
        return planData.length + 1; // all complete
    }

    function getDayOfYear() {
        const date = new Date();
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    function createDayItem(dayObj, translation) {
        const encodedRef = encodeURIComponent(dayObj.reference);

        // Checkbox for manual completion
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = completedDays.includes(dayObj.day);
        checkbox.style.marginRight = "0.5em";
        checkbox.title = "Mark as completed";

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                if (!completedDays.includes(dayObj.day)) {
                    completedDays.push(dayObj.day);
                }
            } else {
                completedDays = completedDays.filter(d => d !== dayObj.day);
            }
            completedDaysByMethod[readingMethodSelect.value] = completedDays;
            localStorage.setItem("completedDaysByMethod", JSON.stringify(completedDaysByMethod));
            renderPlan(translationSelect.value);
        });

        const dayLink = document.createElement("a");
        dayLink.href = `https://www.biblegateway.com/passage/?search=${encodedRef}&version=${translation}`;
        dayLink.textContent = `Day ${dayObj.day}: ${dayObj.reference}`;
        dayLink.target = "_blank";

        const dayItem = document.createElement("li");
        dayItem.classList.add("day-item");
        dayItem.appendChild(checkbox);
        dayItem.appendChild(dayLink);
        return dayItem;
    }

    function renderPlan(translation) {
        readingPlanContainer.innerHTML = "";

        const firstIncompleteDay = getFirstIncompleteDay();
        const currentDayOfYear = getDayOfYear();

        // Section 1: Read (completed days) - collapsed by default
        if (completedDays.length > 0) {
            const readDetails = document.createElement("details");
            // open = false by default (collapsed)

            const readSummary = document.createElement("summary");
            readSummary.textContent = `Read (${completedDays.length} days)`;
            readDetails.appendChild(readSummary);

            const readUl = document.createElement("ul");
            // Sort completed days and show them
            const sortedCompletedDays = [...completedDays].sort((a, b) => a - b);
            sortedCompletedDays.forEach(dayNum => {
                const dayObj = planData.find(d => d.day === dayNum);
                if (dayObj) {
                    readUl.appendChild(createDayItem(dayObj, translation));
                }
            });

            readDetails.appendChild(readUl);
            readingPlanContainer.appendChild(readDetails);
        }

        // Section 2: Plain list - from first unread day through today (always visible)
        const endDay = Math.min(currentDayOfYear, planData.length);
        if (firstIncompleteDay <= endDay) {
            const plainUl = document.createElement("ul");
            for (let dayNum = firstIncompleteDay; dayNum <= endDay; dayNum++) {
                const dayObj = planData.find(d => d.day === dayNum);
                if (dayObj) {
                    plainUl.appendChild(createDayItem(dayObj, translation));
                }
            }
            readingPlanContainer.appendChild(plainUl);
        }

        // Section 3: Unread (days after today) - collapsed by default
        const unreadStartDay = currentDayOfYear + 1;
        if (unreadStartDay <= planData.length) {
            const unreadDetails = document.createElement("details");
            // open = false by default (collapsed)

            const unreadSummary = document.createElement("summary");
            unreadSummary.textContent = `Unread (Day ${unreadStartDay}–${planData.length})`;
            unreadDetails.appendChild(unreadSummary);

            const unreadUl = document.createElement("ul");
            for (let dayNum = unreadStartDay; dayNum <= planData.length; dayNum++) {
                const dayObj = planData.find(d => d.day === dayNum);
                if (dayObj) {
                    unreadUl.appendChild(createDayItem(dayObj, translation));
                }
            }

            unreadDetails.appendChild(unreadUl);
            readingPlanContainer.appendChild(unreadDetails);
        }
    }

    const plansToLoad = {
        chapters: "data/reading-plan.json",
        words: "data/word-reading-plan.json"
    };

    Promise.all(Object.entries(plansToLoad).map(([method, path]) =>
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${path}: ${response.status}`);
                }
                return response.json();
            })
            .then(plan => {
                readingPlans[method] = plan;
            })
    ))
        .then(() => {
            planData = readingPlans[readingMethodSelect.value];
            renderPlan(translationSelect.value);
        })
        .catch(error => {
            readingPlanContainer.textContent = `Failed to load reading plan: ${error.message}`;
        });

    translationSelect.addEventListener("change", function() {
        localStorage.setItem("bibleTranslation", this.value);
        renderPlan(this.value);
    });

    readingMethodSelect.addEventListener("change", function() {
        localStorage.setItem("bibleReadingMethod", this.value);
        if (readingPlans[this.value]) {
            planData = readingPlans[this.value];
            completedDays = completedDaysByMethod[this.value] || [];
            renderPlan(translationSelect.value);
        }
    });
});