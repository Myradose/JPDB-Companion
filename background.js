chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.dueItems) {
            // Update the badge
            chrome.browserAction.setBadgeText({text: request.dueItems});
            chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});
        } else if (request.contentScriptQuery == "fetchDueItems") {
            fetch('https://jpdb.io/')
                .then(response => response.text())
                .then(result => sendResponse(parseDueItems(result)))
                .catch(error => console.log('error', error));
            return true;  // Will respond asynchronously.
        }
    }
);

function parseDueItems(htmlString) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlString, "text/html");
    
    // Select the first paragraph element
    let firstParagraph = doc.querySelector("p");
    
    // Make sure the paragraph was found, otherwise return a default string
    if (firstParagraph) {
        return firstParagraph.innerText;
    }
    return "";
}

