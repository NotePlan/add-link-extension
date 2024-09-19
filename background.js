// Listen for the extension button click
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension button clicked"); // Log when the button is clicked
  executeNotePlanAction(tab);
});

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    console.log("Keyboard shortcut triggered"); // Log when the shortcut is triggered
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      console.log("Tab URL:", tab.url); // Log the URL of the active tab
      executeNotePlanAction(tab);
    });
  }
});

// Function to execute the NotePlan action
function executeNotePlanAction(tab) {
  chrome.storage.sync.get(["todoCharacter", "callbackUrl"], (result) => {
    const todoCharacter =
      result.todoCharacter !== undefined ? result.todoCharacter : "*"; // Default to "*"
    const callbackUrl =
      result.callbackUrl ||
      "noteplan://x-callback-url/addText?noteDate=today&mode=prepend&openNote=yes&text=";

    console.log("To-Do Character:", todoCharacter); // Log the To-Do character
    console.log("Callback URL:", callbackUrl); // Log the callback URL

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: grabUrlAndSendToNotePlan,
      args: [tab.url, todoCharacter, callbackUrl, tab.title], // Pass the tab title as default text
    });
  });
}

// Function to grab the URL and prompt for text input, using tab title as default value
function grabUrlAndSendToNotePlan(
  tabUrl,
  todoCharacter,
  callbackUrlBase,
  defaultText
) {
  console.log("Executing grabUrlAndSendToNotePlan"); // Log when the function runs
  const userText = prompt(
    "Enter the text to include with the link:",
    defaultText
  ); // Default to the tab title
  if (userText) {
    const markdownLink = `[${userText}](${tabUrl})`;
    const formattedText = todoCharacter
      ? `${todoCharacter} ${markdownLink}`
      : markdownLink;
    const xCallbackUrl = `${callbackUrlBase}${encodeURIComponent(
      formattedText
    )}`;
    console.log("Opening NotePlan with URL:", xCallbackUrl); // Log the xCallback URL
    window.open(xCallbackUrl);
  }
}
