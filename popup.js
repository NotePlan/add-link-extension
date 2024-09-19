document.addEventListener("DOMContentLoaded", () => {
  const sendUrlButton = document.getElementById("sendUrl");
  if (sendUrlButton) {
    sendUrlButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab.url.includes("mail.google.com")) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: grabUrlAndSendToNotePlan,
            args: [tab.url],
          });
        } else {
          alert("This extension works only on Gmail.");
        }
      });
    });
  } else {
    console.error("Button with id 'sendUrl' not found.");
  }
});

function grabUrlAndSendToNotePlan(tabUrl) {
  const userText = prompt("Enter the text to include with the link:");
  if (userText) {
    const markdownLink = `* [${userText}](${tabUrl})`;
    const xCallbackUrl = `noteplan://x-callback-url/addText?noteDate=today&mode=prepend&openNote=no&text=${encodeURIComponent(
      markdownLink
    )}`;
    window.open(xCallbackUrl);
  }
}
