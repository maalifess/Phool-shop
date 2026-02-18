// Google Sheets API service for PhoolShop
// This service handles adding order data to a Google Sheet

interface OrderData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  products: string;
  quantity: string;
  notes?: string;
  paymentMethod?: string;
  orderType: 'regular' | 'custom';
  customDetails?: {
    description?: string;
    colors?: string;
    timeline?: string;
  };
}

const GOOGLE_SHEETS_API_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

export const addOrderToGoogleSheet = async (orderData: OrderData): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString();
    const rowData = {
      timestamp,
      orderType: orderData.orderType,
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address || '',
      products: orderData.products,
      quantity: orderData.quantity,
      paymentMethod: orderData.paymentMethod || '',
      notes: orderData.notes || '',
      customDescription: orderData.customDetails?.description || '',
      customColors: orderData.customDetails?.colors || '',
      customTimeline: orderData.customDetails?.timeline || '',
    };

    // For now, we'll store in localStorage as a fallback
    // In production, you'll need to set up Google Apps Script
    const existingOrders = JSON.parse(localStorage.getItem('phool_orders_backup') || '[]');
    existingOrders.push(rowData);
    localStorage.setItem('phool_orders_backup', JSON.stringify(existingOrders));

    // Try to send to Google Sheets if script URL is configured
    if (GOOGLE_SHEETS_API_URL !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
      const response = await fetch(GOOGLE_SHEETS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rowData),
      });

      if (!response.ok) {
        console.warn('Google Sheets submission failed, data saved locally');
        return false;
      }
    }

    console.log('Order data saved successfully');
    return true;
  } catch (error) {
    console.error('Error adding order to Google Sheet:', error);
    // Fallback to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('phool_orders_backup') || '[]');
    existingOrders.push({
      ...orderData,
      timestamp: new Date().toISOString(),
      error: 'Failed to sync to Google Sheets'
    });
    localStorage.setItem('phool_orders_backup', JSON.stringify(existingOrders));
    return false;
  }
};

// Helper function to get orders from localStorage (for admin view)
export const getOrdersFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('phool_orders_backup') || '[]');
  } catch (error) {
    console.error('Error retrieving orders:', error);
    return [];
  }
};

// Instructions for setting up Google Sheets:
/*
1. Create a new Google Sheet with these columns:
   - Timestamp
   - Order Type
   - Name
   - Email
   - Phone
   - Address
   - Products
   - Quantity
   - Payment Method
   - Notes
   - Custom Description
   - Custom Colors
   - Custom Timeline

2. Go to Extensions > Apps Script in your Google Sheet

3. Replace the default code with this:

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    if (!sheet) {
      SpreadsheetApp.getActiveSpreadsheet().insertSheet('Orders');
      const newSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
      newSheet.appendRow(['Timestamp', 'Order Type', 'Name', 'Email', 'Phone', 'Address', 'Products', 'Quantity', 'Payment Method', 'Notes', 'Custom Description', 'Custom Colors', 'Custom Timeline']);
    }
    
    const data = JSON.parse(e.postData.contents);
    const ordersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    ordersSheet.appendRow([
      data.timestamp,
      data.orderType,
      data.name,
      data.email,
      data.phone,
      data.address,
      data.products,
      data.quantity,
      data.paymentMethod,
      data.notes,
      data.customDescription,
      data.customColors,
      data.customTimeline
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

4. Deploy the script as a web app:
   - Click "Deploy" > "New deployment"
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Copy the Web app URL and replace YOUR_SCRIPT_ID in the GOOGLE_SHEETS_API_URL above

5. Add the Web app URL to your environment variables:
   VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec
*/
