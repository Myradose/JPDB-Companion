function updateBadge() {
    var dueItems = document.querySelectorAll(".nav-item span")[0].innerText;
    chrome.runtime.sendMessage({dueItems: dueItems});
}
  
function insertDueCounts(dueText) {
    dueText = dueText.replace(/\u00A0/g, ' ');
    var reviewContainer = document.querySelector('.container.bugfix');
    if (reviewContainer) {
        // Create new div to hold our data
        var dueCountsDiv = document.createElement('div');
        dueCountsDiv.style.fontSize = "20px";
        dueCountsDiv.style.fontWeight = "bold";
        dueCountsDiv.style.textAlign = "center";
        dueCountsDiv.style.marginBottom = "20px";

        let dueCounts = [0, 0, 0];
        var dueItemsMatches = dueText.match(/You have (\d+) due items \((\d+) vocabulary and (\d+) kanji\) and (\d+) new items \((\d+) vocabulary and (\d+) kanji\) available for review./);
        if (dueItemsMatches) {
            dueCounts = [dueItemsMatches[1], dueItemsMatches[2], dueItemsMatches[3]];
        }
        dueItemsMatches = dueText.match(/You have (\d+) due vocabulary and (\d+) new items \((\d+) vocabulary and (\d+) kanji\) available for review./);
        if (dueItemsMatches) {
            dueCounts = [dueItemsMatches[1], dueItemsMatches[1], 0];
        }
        dueItemsMatches = dueText.match(/You have (\d+) due kanji and (\d+) new items \((\d+) vocabulary and (\d+) kanji\) available for review./);
        if (dueItemsMatches) {
            dueCounts = [dueItemsMatches[1], 0, dueItemsMatches[1]];
        }

        var dueItems = dueCounts[0]; // total due items
        var dueVocab = dueCounts[1]; // vocabulary due items
        var dueKanji = dueCounts[2]; // kanji due items

        // Insert the counts with red color
        dueCountsDiv.innerHTML = `<span style='color:red;'>${dueItems}</span> due items (<span style='color:red;'>${dueVocab}</span> vocabulary and <span style='color:red;'>${dueKanji}</span> kanji)`;

        // If our div already exists, remove it
        var existingDiv = document.getElementById('dueCountsDiv');
        if (existingDiv) existingDiv.remove();

        // Assign an id to our new div and insert it at the top of the container
        dueCountsDiv.id = 'dueCountsDiv';
        reviewContainer.insertBefore(dueCountsDiv, reviewContainer.firstChild);
    }
}

function insertTotalReviews(count) {
    var statsContainer = document.querySelector('.container.bugfix');
    if (statsContainer) {
        // Create new div to hold our data
        var totalReviewsDiv = document.createElement('div');
        totalReviewsDiv.style.fontSize = "20px";
        totalReviewsDiv.style.fontWeight = "bold";
        totalReviewsDiv.style.textAlign = "center";
        totalReviewsDiv.style.marginBottom = "20px";

        // Insert the counts with red color
        totalReviewsDiv.innerHTML = `<span style='color:green;'>${count}</span> total reviews today`;

        // If our div already exists, remove it
        var existingDiv = document.getElementById('totalReviewsDiv');
        if (existingDiv) existingDiv.remove();

        // Assign an id to our new div and insert it at the top of the container
        totalReviewsDiv.id = 'totalReviewsDiv';
        statsContainer.insertBefore(totalReviewsDiv, statsContainer.firstChild);
    }
}

// Immediately update the badge and insert due counts on page load
updateBadge();
var prevDueText = localStorage.getItem('prevDueText');
if (prevDueText && window.location.href.includes('review')) {
    insertDueCounts(prevDueText);
} else if (window.location.href.includes('stats')) {
    // Get today's date and ignore the time.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let count = 0;

    fetch('https://jpdb.io/export/reviews.json')
    .then(response => response.json())
    .then(data => {
        // Function to iterate over reviews and count those from today
        function countTodayReviews(reviews) {
            for (const review of reviews) {
                const reviewDate = new Date(review.timestamp * 1000); // Convert Unix timestamp to JavaScript Date
                reviewDate.setHours(0, 0, 0, 0);

                if (reviewDate.getTime() === today.getTime()) {
                    count++;
                }
            }
        }

        // Iterate over the 'cards_vocabulary_jp_en' array
        for (const card of data.cards_vocabulary_jp_en) {
            countTodayReviews(card.reviews);
        }

        // Iterate over the 'cards_kanji_keyword_char' array
        for (const card of data.cards_kanji_keyword_char) {
            countTodayReviews(card.reviews);
        }

        insertTotalReviews(count);
    })
    .catch(error => console.error('Error:', error));

}

function fetchAndInsertDueCounts() {
    // Check if the current URL matches the review page
    if (window.location.href.includes('review')) {
        // Get due items count from the main page
        chrome.runtime.sendMessage({contentScriptQuery: "fetchDueItems"}, dueText => {
            // Update the counts and store the latest information in local storage
            insertDueCounts(dueText);
            localStorage.setItem('prevDueText', dueText);
        });
    }
}

// Fetch the due counts once on page load
fetchAndInsertDueCounts();

// And fetch the due counts every 5 seconds
setInterval(function() {
    updateBadge();
    fetchAndInsertDueCounts();
}, 5000);
