chrome.storage.sync.get(['blockList', 'isFocusModeOn'], (data) => {
    if (data.isFocusModeOn && data.blockList.some(site => window.location.href.includes(site))) {
      window.location.href = "about:blank";
    }
  });
  