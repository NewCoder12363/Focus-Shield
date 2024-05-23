document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startFocus');
  const stopButton = document.getElementById('stopFocus');
  const blockListElement = document.getElementById('blockList');
  const newSiteInput = document.getElementById('newSite');
  const addSiteButton = document.getElementById('addSite');
  const focusDurationInput = document.getElementById('focusDuration');
  const timerElement = document.getElementById('timer');

  chrome.storage.sync.get(['blockList', 'isFocusModeOn', 'endTime'], (data) => {
    updateBlockListUI(data.blockList);
    if (data.isFocusModeOn && data.endTime > Date.now()) {
      startButton.disabled = true;
      stopButton.disabled = false;
      updateTimerDisplay(data.endTime);
    }
  });

  startButton.addEventListener('click', () => {
    const duration = parseInt(focusDurationInput.value, 10) * 60 * 1000;
    chrome.runtime.sendMessage({ action: 'startFocusMode', duration }, (response) => {
      if (response.status === 'success') {
        startButton.disabled = true;
        stopButton.disabled = false;
        updateTimerDisplay(response.endTime);
      }
    });
  });

  stopButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopFocusMode' }, (response) => {
      if (response.status === 'success') {
        startButton.disabled = false;
        stopButton.disabled = true;
        timerElement.textContent = '00:00';
      }
    });
  });

  addSiteButton.addEventListener('click', () => {
    const newSite = newSiteInput.value.trim();
    if (newSite) {
      chrome.storage.sync.get(['blockList'], (data) => {
        const updatedBlockList = [...(data.blockList || []), newSite];
        chrome.storage.sync.set({ blockList: updatedBlockList }, () => {
          updateBlockListUI(updatedBlockList);
          newSiteInput.value = '';
        });
      });
    }
  });

  function updateBlockListUI(blockList) {
    blockListElement.innerHTML = '';
    blockList.forEach(site => {
      const li = document.createElement('li');
      li.textContent = site;
      blockListElement.appendChild(li);
    });
  }

  function updateTimerDisplay(endTime) {
    const intervalId = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(intervalId);
        timerElement.textContent = '00:00';
      } else {
        const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    }, 1000);
  }
});
