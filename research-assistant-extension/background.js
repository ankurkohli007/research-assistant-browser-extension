// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Research Assistant — background.js
// Handles downloads and message routing from side panel

// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// // Listen for download requests from the side panel
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === 'downloadFile') {
//     const { content, filename, mimeType } = request;
    
//     // Create blob in the background context (proper context)
//     const blob = new Blob([content], { type: mimeType });
//     const blobUrl = URL.createObjectURL(blob);
    
//     // Download using chrome.downloads API
//     chrome.downloads.download({
//       url: blobUrl,
//       filename: filename,
//       saveAs: false  // Directly saves to Downloads folder
//     }, (downloadId) => {
//       // Clean up the object URL after download starts
//       setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
//       sendResponse({ success: true, downloadId: downloadId });
//     });
    
//     return true; // Keep channel open for async response
//   }
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === 'downloadFile') {
  
//       try {
//         // Convert content to base64 data URL
//         const dataUrl =
//           'data:' + message.mimeType + ';charset=utf-8,' +
//           encodeURIComponent(message.content);
  
//         chrome.downloads.download({
//           url: dataUrl,
//           filename: message.filename,
//           saveAs: true
//         }, (downloadId) => {
  
//           if (chrome.runtime.lastError) {
//             console.error(chrome.runtime.lastError);
//             sendResponse({
//               success: false,
//               error: chrome.runtime.lastError.message
//             });
//           } else {
//             sendResponse({
//               success: true,
//               downloadId
//             });
//           }
//         });
  
//       } catch (err) {
//         console.error(err);
  
//         sendResponse({
//           success: false,
//           error: err.message
//         });
//       }
  
//       return true;
//     }
//   });

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