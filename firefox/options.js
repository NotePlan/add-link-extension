// @flow
/**
 * Options page script for Send URL to NotePlan (Firefox version)
 * Manages extension settings: to-do character prefix and custom callback URL.
 */

document.addEventListener("DOMContentLoaded", async () => {
  /** @type {HTMLSelectElement} */
  const todoCharacterSelect = document.getElementById("todoCharacter");
  /** @type {HTMLInputElement} */
  const callbackUrlInput = document.getElementById("callbackUrl");
  /** @type {HTMLButtonElement} */
  const saveButton = document.getElementById("save");
  /** @type {HTMLElement} */
  const status = document.getElementById("status");
  /** @type {HTMLElement} */
  const urlValidation = document.getElementById("urlValidation");

  // Load the saved settings when the options page is opened
  const result = await browser.storage.sync.get(["todoCharacter", "callbackUrl"]);
  if (result.todoCharacter) {
    todoCharacterSelect.value = result.todoCharacter;
  }
  if (result.callbackUrl) {
    callbackUrlInput.value = result.callbackUrl;
  }

  // Save the settings when the user clicks "Save"
  saveButton.addEventListener("click", async () => {
    const todoCharacter = todoCharacterSelect.value;
    const callbackUrl = callbackUrlInput.value;

    // Check if the URL is valid (must start with "noteplan://")
    if (callbackUrl && !callbackUrl.startsWith("noteplan://")) {
      urlValidation.classList.remove("hidden");
      return;
    } else {
      urlValidation.classList.add("hidden");
    }

    await browser.storage.sync.set({ todoCharacter, callbackUrl });
    status.classList.remove("hidden");
    setTimeout(() => {
      status.classList.add("hidden");
    }, 2000);
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
