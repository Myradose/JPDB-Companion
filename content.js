function updateBadge() {
    var dueItems = document.querySelectorAll(".nav-item span")[0].innerText;
    chrome.runtime.sendMessage({dueItems: dueItems});
}
  
function insertDueCounts() {
    // Check if the current URL matches the review page
    if (window.location.href.includes('review')) {
        // Get due items count from the main page
        chrome.runtime.sendMessage({contentScriptQuery: "fetchDueItems"}, dueText => {
            var reviewContainer = document.querySelector('.container.bugfix');
            if (reviewContainer) {
                // Create new div to hold our data
                var dueCountsDiv = document.createElement('div');
                dueCountsDiv.style.fontSize = "20px";
                dueCountsDiv.style.fontWeight = "bold";
                dueCountsDiv.style.textAlign = "center";
                dueCountsDiv.style.marginBottom = "20px";

                // Extract the counts from the dueText
                var dueItemsMatches = dueText.match(/(\d+) due items \((\d+) vocabulary and (\d+) kanji\)/);
                if (dueItemsMatches) {
                    var dueItems = dueItemsMatches[1]; // total due items
                    var dueVocab = dueItemsMatches[2]; // vocabulary due items
                    var dueKanji = dueItemsMatches[3]; // kanji due items

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
        });
    }
}

// Immediately update the badge and insert due counts on page load
updateBadge();
insertDueCounts();

// And update the badge and due counts every 5 seconds
setInterval(function() {
    updateBadge();
    insertDueCounts();
}, 5000);
