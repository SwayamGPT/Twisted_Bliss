document.addEventListener('DOMContentLoaded', async () => {
  // Try to get the selected text from the active tab
  try {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const selectedText = results[0].result.trim();
          document.getElementById('rawText').value = selectedText;
          
          // Basic heuristic parsing
          const lines = selectedText.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length > 0) {
            // Assume first line might be a name if short enough
            if (lines[0].length < 30) {
              document.getElementById('custName').value = lines[0];
            }
          }
        }
      });
    }
  } catch (e) {
    console.error("Could not inject script to get selection", e);
  }

  // Handle the 'Send to Dashboard' button click
  document.getElementById('importBtn').addEventListener('click', async () => {
    const importBtn = document.getElementById('importBtn');
    const statusEl = document.getElementById('status');
    importBtn.disabled = true;

    const custName = document.getElementById('custName').value || 'Unknown IG Customer';
    const custPhone = document.getElementById('custPhone').value;
    const custAddr = document.getElementById('custAddr').value;
    const rawText = document.getElementById('rawText').value || 'No product details';
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;

    // Construct the payload mapping to the Twisted Bliss backend schema
    const payload = {
      customerName: custName,
      customerPhone: custPhone || "",
      customerAddress: custAddr || "",
      orderDate: new Date().toISOString().split('T')[0],
      products: [
        { name: rawText, qty: 1, price: totalAmount }
      ],
      shippingCharge: 0,
      totalAmount: totalAmount,
      status: 'Pending'
    };

    statusEl.innerHTML = "Sending...";
    statusEl.className = "";
    
    // We try localhost:3001 which is the backend server running
    try {
      const res = await fetch("http://localhost:3001/api/customer_orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        statusEl.innerHTML = "✅ Imported to Dashboard!";
        statusEl.className = "success";
        setTimeout(() => window.close(), 2000);
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (e) {
      statusEl.innerHTML = "❌ Error: " + e.message + " (Is the server running on port 3001?)";
      statusEl.className = "error";
      importBtn.disabled = false;
    }
  });
});
