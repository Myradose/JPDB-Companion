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
    let dueItems = doc.querySelector(".strong").innerText;
    let dueVocab = doc.querySelector(".strong:nth-child(2)").innerText;
    let dueKanji = doc.querySelector(".strong:nth-child(3)").innerText;
    return dueItems + " due items (" + dueVocab + " vocabulary and " + dueKanji + " kanji)";
}
