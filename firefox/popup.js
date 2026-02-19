// @flow
/**
 * Popup script for Send URL to NotePlan (Firefox version)
 *
 * Runs inside the extension popup — has full access to browser.* APIs.
 * Protocol URLs (noteplan://) are opened via an <a> element click, which
 * triggers the OS protocol handler reliably in Firefox/Zen.
 */

/**
 * Remove email addresses and clean up surrounding dashes/whitespace from text.
 * Matches the Chrome extension's removeEmail() behavior.
 * @param {string} text - The text to clean
 * @returns {string} Cleaned text with emails and stray dashes removed
 */
function removeEmail(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let cleanedText = text.replace(emailRegex, '');
  cleanedText = cleanedText.replace(/\s*-\s*-\s*/g, ' - ')
                            .replace(/\s+-\s+/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
  return cleanedText;
}

document.addEventListener("DOMContentLoaded", async () => {
  /** @type {HTMLInputElement} */
  const textBeforeInput = document.getElementById("np-text-before");
  /** @type {HTMLInputElement} */
  const linkTextInput = document.getElementById("np-link-text");
  /** @type {HTMLInputElement} */
  const textAfterInput = document.getElementById("np-text-after");
  /** @type {HTMLButtonElement} */
  const copyButton = document.getElementById("np-copy-button");
  /** @type {HTMLButtonElement} */
  const sendButton = document.getElementById("np-send-button");
  /** @type {HTMLElement} */
  const statusEl = document.getElementById("np-status");

  // --- Load active tab info ---
  let tabUrl = "";
  let tabTitle = "";
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      tabUrl = tabs[0].url || "";
      tabTitle = tabs[0].title || "";
    }
  } catch (err) {
    console.error("[NP popup] failed to query active tab:", err);
  }
  linkTextInput.value = removeEmail(tabTitle);

  // --- Load saved settings ---
  let todoCharacter = "*";
  let callbackUrl =
    "noteplan://x-callback-url/addText?noteDate=today&mode=prepend&openNote=no&text=";
  try {
    const result = await browser.storage.sync.get(["todoCharacter", "callbackUrl"]);
    if (result.todoCharacter !== undefined) todoCharacter = result.todoCharacter;
    if (result.callbackUrl) callbackUrl = result.callbackUrl;
  } catch (err) {
    console.error("[NP popup] failed to load settings:", err);
  }

  textBeforeInput.focus();

  // --- Helpers ---

  /** @returns {string} Formatted markdown text from the current input values */
  function buildFormattedText() {
    const textBefore = textBeforeInput.value;
    const linkText = linkTextInput.value;
    const textAfter = textAfterInput.value;
    const markdownLink = "[" + linkText + "](" + tabUrl + ")";
    if (todoCharacter) {
      return (todoCharacter + " " + textBefore + " " + markdownLink + " " + textAfter).trim();
    }
    return (textBefore + " " + markdownLink + " " + textAfter).trim();
  }

  /**
   * Show a status message in the popup
   * @param {string} message
   * @param {"success"|"error"} type
   */
  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.style.display = "block";
    statusEl.style.backgroundColor = type === "success" ? "#d4edda" : "#f8d7da";
    statusEl.style.color = type === "success" ? "#155724" : "#721c24";
    setTimeout(() => {
      statusEl.style.display = "none";
    }, 2500);
  }

  /**
   * Open a custom-protocol URL by simulating a real link click.
   * This triggers the OS protocol handler — unlike browser.tabs.create()
   * which doesn't hand off custom protocols in Firefox/Zen.
   * @param {string} url - The noteplan:// URL to open
   */
  function openProtocolUrl(url) {
    const a = document.createElement("a");
    a.href = url;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // --- Copy to Clipboard ---
  copyButton.addEventListener("click", async () => {
    const text = buildFormattedText();
    console.log("[NP popup] copying:", text);
    try {
      await navigator.clipboard.writeText(text);
      showStatus("Copied to clipboard!", "success");
    } catch (err) {
      console.error("[NP popup] clipboard.writeText failed, trying fallback:", err);
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        showStatus("Copied to clipboard!", "success");
      } catch (err2) {
        console.error("[NP popup] fallback copy also failed:", err2);
        showStatus("Copy failed — see console", "error");
      }
    }
  });

  // --- Send to NotePlan ---
  sendButton.addEventListener("click", () => {
    const text = buildFormattedText();
    const fullUrl = callbackUrl + encodeURIComponent(text);
    console.log("[NP popup] sending to NotePlan:", fullUrl);
    openProtocolUrl(fullUrl);
    showStatus("Sent to NotePlan!", "success");
  });

  // Enter key triggers Send
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendButton.click();
    }
  });
});
