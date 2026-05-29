chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({
      openPanelOnActionClick: true
    })
    .catch((err) => console.error(err));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'downloadFile') {

    try {

      const dataUrl =
        'data:' + message.mimeType + ';charset=utf-8,' +
        encodeURIComponent(message.content);

      chrome.downloads.download({
        url: dataUrl,
        filename: message.filename,
        saveAs: true
      }, (downloadId) => {

        if (chrome.runtime.lastError) {

          console.error(chrome.runtime.lastError);

          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message
          });

        } else {

          sendResponse({
            success: true,
            downloadId
          });
        }
      });

    } catch (err) {

      console.error(err);

      sendResponse({
        success: false,
        error: err.message
      });
    }

    return true;
  }
});