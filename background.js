chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if ("url" in changeInfo) {
        chrome.tabs.sendMessage(tabId, {
            message: "update"
        });
    }
});