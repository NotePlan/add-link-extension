document.addEventListener("DOMContentLoaded", () => {
  const todoCharacterSelect = document.getElementById("todoCharacter");
  const callbackUrlInput = document.getElementById("callbackUrl");
  const saveButton = document.getElementById("save");
  const status = document.getElementById("status");
  const urlValidation = document.getElementById("urlValidation");

  // Load the saved settings when the options page is opened
  chrome.storage.sync.get(["todoCharacter", "callbackUrl"], (result) => {
    if (result.todoCharacter) {
      todoCharacterSelect.value = result.todoCharacter;
    }
    if (result.callbackUrl) {
      callbackUrlInput.value = result.callbackUrl;
    }
  });

  // Save the settings when the user clicks "Save"
  saveButton.addEventListener("click", () => {
    const todoCharacter = todoCharacterSelect.value;
    const callbackUrl = callbackUrlInput.value;

    // Check if the URL is valid (must start with "noteplan://")
    if (callbackUrl && !callbackUrl.startsWith("noteplan://")) {
      urlValidation.classList.remove("hidden");
      return;
    } else {
      urlValidation.classList.add("hidden");
    }

    chrome.storage.sync.set({ todoCharacter, callbackUrl }, () => {
      status.classList.remove("hidden");
      setTimeout(() => {
        status.classList.add("hidden");
      }, 2000);
    });
  });

  // Validate the URL when the input loses focus
  callbackUrlInput.addEventListener("blur", () => {
    const callbackUrl = callbackUrlInput.value;
    if (callbackUrl && !callbackUrl.startsWith("noteplan://")) {
      urlValidation.classList.remove("hidden");
    } else {
      urlValidation.classList.add("hidden");
    }
  });
});
