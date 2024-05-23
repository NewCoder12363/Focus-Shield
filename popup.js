document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

function updateTimerDisplay(endTime) {
  const timerElement = document.getElementById('timer');
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

chrome.storage.sync.get(['endTime'], (data) => {
  if (data.endTime > Date.now()) {
    updateTimerDisplay(data.endTime);
  }
});
