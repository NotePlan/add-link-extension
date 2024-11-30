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
    const markdownLink = `* [${removeEmail(userText)}](${removeEmail(tabUrl)})`;
    const xCallbackUrl = `noteplan://x-callback-url/addText?noteDate=today&mode=prepend&openNote=no&text=${encodeURIComponent(
      markdownLink
    )}`;
    window.open(xCallbackUrl);
  }
}

function removeEmail(text) {
  // Regular expression to match email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  // First remove the email
  let cleanedText = text.replace(emailRegex, '');
  
  // Remove double dashes or single dash surrounded by spaces
  cleanedText = cleanedText.replace(/\s*-\s*-\s*/g, ' - ') // Replace double dashes
                          .replace(/\s+-\s+/g, ' ') // Remove single dash surrounded by spaces
                          .replace(/\s+/g, ' ') // Clean up any extra whitespace
                          .trim();
  
  return cleanedText;
}