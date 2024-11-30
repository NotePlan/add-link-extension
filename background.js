// Listen for the extension button click
chrome.action.onClicked.addListener((tab) => {
  executeNotePlanAction(tab);
});

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      executeNotePlanAction(tab);
    });
  }
});

// Function to execute the NotePlan action
function executeNotePlanAction(tab) {
  chrome.storage.sync.get(["todoCharacter", "callbackUrl"], (result) => {
    const todoCharacter = result.todoCharacter !== undefined ? result.todoCharacter : "*"; // Default to "*"
    const callbackUrl = result.callbackUrl || "noteplan://x-callback-url/addText?noteDate=today&mode=prepend&openNote=no&text=";

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showCustomPrompt,
      args: [tab.url, todoCharacter, callbackUrl, tab.title], // Pass the tab title as default text
    });
  });
}

// Function to inject a custom modal into the page
function showCustomPrompt(tabUrl, todoCharacter, callbackUrlBase, defaultText) {
  // Create the iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.zIndex = '9999'; // Ensure it's on top of other elements
  iframe.style.backgroundColor = 'transparent'; // Transparent background
  iframe.allowTransparency = 'true';

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

  // Append the iframe to the body
  document.body.appendChild(iframe);

  // Set the iframe's document content
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write('<!DOCTYPE html><html><head></head><body></body></html>');
  iframeDoc.close();

  // Re-enable pointer events within the iframe
  iframe.style.pointerEvents = 'auto';

  // Create the link element for Tailwind CSS
  const tailwindLink = iframeDoc.createElement('link');
  tailwindLink.rel = 'stylesheet';
  tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';

  // Append the link element to the iframe's head
  iframeDoc.head.appendChild(tailwindLink);

  // Wait for Tailwind CSS to load before showing the modal
  tailwindLink.onload = () => {
    // Modal HTML content
    const modalHtml = `
      <!-- Your modal HTML content goes here -->
      <div id="modal-container" class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div id="backdrop" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <button id="close-button" class="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none z-50">
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm">
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div>
                  <div class="flex items-center gap-2 mb-6">
                    <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-light sm:mx-0 sm:h-10 sm:w-10">
                      <svg class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 7.125L16.862 4.487M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold leading-6 text-gray-900" id="modal-title">Create NotePlan Link</h3>
                  </div>
                  <div class="mt-3 text-center sm:mt-0 sm:text-left">
                    <div class="mt-2">
                      <div class="mb-4">
                        <label for="text-before" class="block text-sm font-medium leading-6 text-gray-900">Text before:</label>
                        <div class="mt-1">
                          <input id="text-before" autocomplete="given-name" class="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        </div>
                      </div>
                      <div class="mb-4">
                        <label for="link-text" class="block text-sm font-medium leading-6 text-gray-900">Link text:</label>
                        <div class="mt-1">
                          <input id="link-text" type="text" value="${removeEmail(defaultText)}" class="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        </div>
                      </div>
                      <div class="mb-4">
                        <label for="text-after" class="block text-sm font-medium leading-6 text-gray-900">Text after:</label>
                        <div class="mt-1">
                          <input id="text-after" type="text" class="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button id="send-button" type="button" class="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto">Send to NotePlan</button>
                <button id="copy-button" type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Copy to Clipboard</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Append the modal HTML to the iframe's body
    iframeDoc.body.innerHTML = modalHtml;

    // Custom styles for the modal
    const style = iframeDoc.createElement('style');
    style.textContent = `
      .bg-primary {
        background-color: #fb7d0e;
      }
      #send-button:hover {
        background-color: #eb640a;
      }
      .text-primary {
        --tw-text-opacity: 1;
        color: #fb7d0e;
      }
      .bg-primary-light{
        background-color: rgb(255 237 213);
      }
    `;
    iframeDoc.head.appendChild(style);

    
    // Get elements within the iframe
    const textBeforeInput = iframeDoc.getElementById('text-before');
    const linkTextInput = iframeDoc.getElementById('link-text');
    const textAfterInput = iframeDoc.getElementById('text-after');
    const sendButton = iframeDoc.getElementById('send-button');
    const copyButton = iframeDoc.getElementById('copy-button');
    const closeButton = iframeDoc.getElementById('close-button');
    const backdrop = iframeDoc.getElementById('backdrop');

    // Focus on the first input field
    textBeforeInput.focus();

    // Close the modal function
    const closeModal = () => {
      document.body.removeChild(iframe);
    };

    // Event listener for Copy to Clipboard button
    copyButton.addEventListener('click', () => {
      // Collect input values
      const textBefore = textBeforeInput.value;
      const linkText = linkTextInput.value;
      const textAfter = textAfterInput.value;
      const markdownLink = `[${linkText}](${tabUrl})`;
      const formattedText = todoCharacter
        ? `${todoCharacter} ${textBefore} ${markdownLink} ${textAfter}`.trim()
        : `${textBefore} ${markdownLink} ${textAfter}`.trim();

      // Copy to clipboard
      navigator.clipboard.writeText(formattedText).then(() => {
        alert('Link copied to clipboard!');
      });

      closeModal();
    });

    // Event listener for Send to NotePlan button
    sendButton.addEventListener('click', () => {
      // Collect input values
      const textBefore = textBeforeInput.value;
      const linkText = linkTextInput.value;
      const textAfter = textAfterInput.value;
      const markdownLink = `[${linkText}](${tabUrl})`;
      const formattedText = todoCharacter
        ? `${todoCharacter} ${textBefore} ${markdownLink} ${textAfter}`.trim()
        : `${textBefore} ${markdownLink} ${textAfter}`.trim();
      const xCallbackUrl = `${callbackUrlBase}${encodeURIComponent(formattedText)}`;

      window.open(xCallbackUrl);
      closeModal();
    });

    // Close the modal when clicking on the backdrop
    backdrop.addEventListener('click', () => {
      closeModal();
    });
    
    // Close the modal when clicking on the close button
    closeButton.addEventListener('click', () => {
      closeModal();
    });

    // Handle keyboard events within the iframe
    iframeDoc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Enter') {
        sendButton.click();
      }
    });
  };

  // Handle the case where Tailwind CSS fails to load
  tailwindLink.onerror = () => {
    console.error('Failed to load Tailwind CSS');
    alert('Failed to load resources. Please check your internet connection.');
    // Close the modal or take appropriate action
    document.body.removeChild(iframe);
  };
}
