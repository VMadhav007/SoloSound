document.getElementById("toggleButton").addEventListener("click", () => {
    // Send a message to the background script to toggle the feature
    const port = chrome.runtime.connect();
    port.postMessage({ action: "toggleAudioManager" });
  
    // Update button text based on the state
    const button = document.getElementById("toggleButton");
  
    // Fetch the state after toggling
    chrome.runtime.sendMessage({ action: "getState" }, (response) => {
      if (response && response.enabled !== undefined) {
        button.textContent = response.enabled ? "Disable Audio Manager" : "Enable Audio Manager";
      } else {
        console.error("No response or response.enabled is undefined");
      }
    });
  });
  