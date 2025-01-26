let currentAudioTabId = null;
let audioManagerEnabled = true;

// Fetch the initial state from storage when the extension starts
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(["audioManagerEnabled"], function(result) {
    audioManagerEnabled = result.audioManagerEnabled !== undefined ? result.audioManagerEnabled : true;
  });
});

// Listen for the state request from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getState") {
    // Ensure the response contains the correct state of audioManagerEnabled
    sendResponse({ enabled: audioManagerEnabled });
  }
});

// Set up an event listener for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (audioManagerEnabled && changeInfo.status === "complete" && tab.audible) {
    handleAudioPlayback(tabId);
  }
});

// Handle the audio playback behavior
async function handleAudioPlayback(newTabId) {
  // Mute the previous tab if it's playing audio
  if (currentAudioTabId && currentAudioTabId !== newTabId) {
    try {
      await chrome.tabs.update(currentAudioTabId, { muted: true });
    } catch (err) {
      console.error(`Failed to mute tab ${currentAudioTabId}:`, err);
    }
  }

  // Unmute the new tab
  try {
    await chrome.tabs.update(newTabId, { muted: false });
    currentAudioTabId = newTabId;
  } catch (err) {
    console.error(`Failed to unmute tab ${newTabId}:`, err);
  }
}

// Listen for changes in the popup (turn audio manager on/off)
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    if (msg.action === "toggleAudioManager") {
      audioManagerEnabled = !audioManagerEnabled;
      console.log(`Audio Manager is now ${audioManagerEnabled ? 'Enabled' : 'Disabled'}`);
    }
  });
});
