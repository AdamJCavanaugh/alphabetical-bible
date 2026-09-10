// filepath: /bible-reading-plan/bible-reading-plan/src/scripts/app.js

document.addEventListener("DOMContentLoaded", function() {
    const readingPlanContainer = document.getElementById("reading-plan");
    const translationSelect = document.getElementById("translation-select");
    let planData = [];

    // Load saved translation from localStorage, if any
    const savedTranslation = localStorage.getItem("bibleTranslation");
    if (savedTranslation) {
        translationSelect.value = savedTranslation;
    }

    // Load completed days from localStorage
    let completedDays = JSON.parse(localStorage.getItem("completedDays") || "[]");

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
            localStorage.setItem("completedDays", JSON.stringify(completedDays));
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

    fetch("data/reading-plan.json")
        .then(response => response.json())
        .then(plan => {
            planData = plan;
            renderPlan(translationSelect.value);
        })
        .catch(error => {
            readingPlanContainer.textContent = "Failed to load reading plan.";
        });

    translationSelect.addEventListener("change", function() {
        localStorage.setItem("bibleTranslation", this.value);
        renderPlan(this.value);
    });
});