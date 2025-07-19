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
        return 1; // fallback to 1 if all are complete
    }

    function renderPlan(translation) {
        readingPlanContainer.innerHTML = "";

        // Group days into blocks of 10
        const groups = [];
        for (let i = 0; i < planData.length; i += 10) {
            groups.push(planData.slice(i, i + 10));
        }

        // Find which group contains the first incomplete day
        const firstIncompleteDay = getFirstIncompleteDay();
        const openGroupIdx = Math.floor((firstIncompleteDay - 1) / 10);

        groups.forEach((group, idx) => {
            const details = document.createElement("details");
            details.open = (idx === openGroupIdx);

            const summary = document.createElement("summary");
            const startDay = group[0].day;
            const endDay = group[group.length - 1].day;
            summary.textContent = `Days ${startDay}–${endDay}`;
            details.appendChild(summary);

            const ul = document.createElement("ul");
            group.forEach(dayObj => {
                const encodedRef = encodeURIComponent(dayObj.reference);
                const dayLink = document.createElement("a");
                dayLink.href = `https://www.biblegateway.com/passage/?search=${encodedRef}&version=${translation}`;
                dayLink.textContent = `Day ${dayObj.day}: ${dayObj.reference}`;
                dayLink.target = "_blank";

                // Track visited/completed days
                const dayItem = document.createElement("li");
                dayItem.classList.add("day-item");

                // Marker: check mark if completed, else circle
                const marker = document.createElement("span");
                marker.style.marginRight = "0.5em";
                marker.textContent = completedDays.includes(dayObj.day) ? "✔️" : "◯";
                dayItem.prepend(marker);

                // When link is clicked, mark as completed
                dayLink.addEventListener("click", () => {
                    if (!completedDays.includes(dayObj.day)) {
                        completedDays.push(dayObj.day);
                        localStorage.setItem("completedDays", JSON.stringify(completedDays));
                        marker.textContent = "✔️";
                    }
                });

                dayItem.appendChild(dayLink);
                ul.appendChild(dayItem);
            });

            details.appendChild(ul);
            readingPlanContainer.appendChild(details);
        });
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