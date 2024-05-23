const blockList = ["facebook.com", "twitter.com", "instagram.com"];
let isFocusModeOn = false;
let timerDuration = 25 * 60 * 1000; // 25 minutes

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blockList, isFocusModeOn, timerDuration });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "focusTimer") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Focus Shield",
      message: "Time to take a break!",
      priority: 2
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.sync.get(['isFocusModeOn', 'blockList'], (data) => {
    if (data.isFocusModeOn && data.blockList.some(site => tab.url.includes(site))) {
      chrome.tabs.remove(tabId);
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startFocusMode") {
    isFocusModeOn = true;
    chrome.storage.sync.set({ isFocusModeOn });
    chrome.alarms.create("focusTimer", { delayInMinutes: 25 });
  } else if (request.action === "stopFocusMode") {
    isFocusModeOn = false;
    chrome.storage.sync.set({ isFocusModeOn });
    chrome.alarms.clear("focusTimer");
  }
  sendResponse({ status: "success" });
});


chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blockList: [], isFocusModeOn: false, endTime: 0 });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startFocusMode') {
    const endTime = Date.now() + request.duration;
    chrome.storage.sync.set({ isFocusModeOn: true, endTime }, () => {
      sendResponse({ status: 'success', endTime });
    });
    return true; // Keep the message channel open for sendResponse
  } else if (request.action === 'stopFocusMode') {
    chrome.storage.sync.set({ isFocusModeOn: false, endTime: 0 }, () => {
      sendResponse({ status: 'success' });
    });
    return true; // Keep the message channel open for sendResponse
  }
});
