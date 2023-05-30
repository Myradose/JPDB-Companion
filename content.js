function updateBadge() {
    var dueItems = document.querySelectorAll(".nav-item span")[0].innerText;
    chrome.runtime.sendMessage({dueItems: dueItems});
}
  
function insertDueCounts(dueText) {
    // dueText = dueText.replace(/(\r\n|\n|\r)/gm, " "); // remove newlines
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
        console.log(dueText);
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

// Immediately update the badge and insert due counts on page load
updateBadge();
var prevDueText = localStorage.getItem('prevDueText');
if (prevDueText && window.location.href.includes('review')) {
    insertDueCounts(prevDueText);
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
