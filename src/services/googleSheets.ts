

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
  status?: 'Under Process' | 'Dispatched' | 'Completed' | 'Cancelled';
  customDetails?: {
    description?: string;
    colors?: string;
    timeline?: string;
  };
}

const GOOGLE_SHEETS_API_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

export const addOrderToGoogleSheet = async (orderData: OrderData): Promise<boolean> => {
  try {
    console.log('🚀 Starting Google Sheets submission...');
    console.log('📋 Order data:', orderData);
    console.log('🔗 API URL:', GOOGLE_SHEETS_API_URL);
    
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
      status: orderData.status || 'Under Process',
      customDescription: orderData.customDetails?.description || '',
      customColors: orderData.customDetails?.colors || '',
      customTimeline: orderData.customDetails?.timeline || '',
    };

    console.log('📤 Row data prepared:', rowData);

    // For now, we'll store in localStorage as a fallback
    // In production, you'll need to set up Google Apps Script
    const existingOrders = JSON.parse(localStorage.getItem('phool_orders_backup') || '[]');
    existingOrders.push(rowData);
    localStorage.setItem('phool_orders_backup', JSON.stringify(existingOrders));
    console.log('💾 Data saved to localStorage as backup');

    // Try to send to Google Sheets if script URL is configured
    if (GOOGLE_SHEETS_API_URL !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
      console.log('🌐 Sending to Google Sheets...');
      try {
        const response = await fetch(GOOGLE_SHEETS_API_URL, {
          method: 'POST',
          mode: 'no-cors', // Handle CORS issues
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rowData),
        });

        console.log('📡 Request sent (no-cors mode)');
        // With no-cors, we can't read the response, but assume success if no error
        console.log('✅ Google Sheets request completed (response unreadable due to CORS)');
      } catch (fetchError) {
        console.warn('❌ Google Sheets fetch failed:', fetchError);
        console.warn('📊 Data saved locally instead');
        return false;
      }
    } else {
      console.log('⚠️ Google Sheets URL not configured, using localStorage only');
    }

    console.log('🎉 Order data saved successfully');
    return true;
  } catch (error) {
    console.error('💥 Error adding order to Google Sheet:', error);
    // Fallback to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('phool_orders_backup') || '[]');
    existingOrders.push({
      ...orderData,
      timestamp: new Date().toISOString(),
      status: orderData.status || 'Under Process',
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

// Helper function to save orders to localStorage (for admin status updates)
export const saveOrdersToStorage = (orders: any[]) => {
  try {
    localStorage.setItem('phool_orders_backup', JSON.stringify(orders));
    console.log('Orders saved to localStorage successfully');
  } catch (error) {
    console.error('Error saving orders to localStorage:', error);
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
