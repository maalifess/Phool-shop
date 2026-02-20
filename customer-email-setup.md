# Customer Email Setup Guide

## ✅ **Customer Email System Implemented!**

Your Phool Shop now sends **two emails** for every order:

### 📧 **Email System Overview:**

1. **Admin Email** (Current Template - `template_14zefe9`)
   - Sent to: Shop owner (you)
   - Purpose: Order notification for processing
   - Template: Your existing admin notification template

2. **Customer Email** (New Template - Needs Creation)
   - Sent to: Customer who placed the order
   - Purpose: Order confirmation with details
   - Template: Needs to be created in EmailJS

## 🔧 **Setup Required:**

### Step 1: Create Customer Email Template in EmailJS

1. **Go to EmailJS**: https://www.emailjs.com/
2. **Login** to your account
3. **Go to "Email Templates"** in the left sidebar
4. **Click "Create New Template"**
5. **Template Settings**:
   - Template Name: "Customer Order Confirmation"
   - Template ID: Copy this ID (e.g., `template_customer_confirm`)
   - To Email: `{{to_email}}` (dynamic customer email)

### Step 2: Customer Email Template Content

**Subject**: `Order Confirmation - {{order_id}} from Phool Shop`

**Email Body**: Use this beautiful HTML template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Phool Shop</title>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Quicksand', sans-serif; background-color: #fef3f2;">
    <div style="max-width: 600px; margin: 20px auto; background: linear-gradient(135deg, #fff5f5 0%, #ffe0e6 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(255, 182, 193, 0.2); border: 2px solid #ffc2d1;">
        
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #ffb3c1 0%, #ff8fa3 100%); padding: 30px; text-align: center; border-bottom: 3px solid #ff758f;">
            <h1 style="margin: 0; color: #fff; font-size: 32px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); letter-spacing: 1px;">
                🌸 Order Confirmed! 🌸
            </h1>
            <p style="margin: 10px 0 0 0; color: #fff; font-size: 16px; font-weight: 500; opacity: 0.95;">
                Thank you for your order from Phool Shop
            </p>
        </div>

        <!-- Order ID Badge -->
        <div style="text-align: center; padding: 20px;">
            <div style="display: inline-block; background: #fff; padding: 12px 24px; border-radius: 50px; box-shadow: 0 4px 12px rgba(255, 182, 193, 0.3); border: 2px dashed #ff8fa3;">
                <span style="color: #d63384; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order ID</span>
                <div style="color: #a61e4d; font-size: 20px; font-weight: 700; margin-top: 4px; font-family: 'Courier New', monospace;">{{order_id}}</div>
            </div>
        </div>

        <!-- Customer Information -->
        <div style="padding: 0 30px 20px;">
            <div style="background: #fff; border-radius: 20px; padding: 25px; box-shadow: 0 4px 16px rgba(255, 182, 193, 0.15); border: 1px solid #ffe0e6;">
                <h2 style="margin: 0 0 20px 0; color: #d63384; font-size: 22px; font-weight: 600; text-align: center; position: relative;">
                    <span style="background: #ffe0e6; padding: 8px 20px; border-radius: 15px; display: inline-block;">Customer Information</span>
                </h2>
                <div style="display: grid; gap: 15px;">
                    <div style="display: flex; align-items: center; padding: 12px; background: #fef7f7; border-radius: 12px; border-left: 4px solid #ff8fa3;">
                        <span style="color: #a61e4d; font-weight: 600; min-width: 100px; font-size: 14px;">Name:</span>
                        <span style="color: #495057; font-weight: 500; font-size: 15px;">{{to_name}}</span>
                    </div>
                    <div style="display: flex; align-items: center; padding: 12px; background: #fef7f7; border-radius: 12px; border-left: 4px solid #ff8fa3;">
                        <span style="color: #a61e4d; font-weight: 600; min-width: 100px; font-size: 14px;">Email:</span>
                        <span style="color: #495057; font-weight: 500; font-size: 15px;">{{to_email}}</span>
                    </div>
                    <div style="display: flex; align-items: center; padding: 12px; background: #fef7f7; border-radius: 12px; border-left: 4px solid #ff8fa3;">
                        <span style="color: #a61e4d; font-weight: 600; min-width: 100px; font-size: 14px;">Phone:</span>
                        <span style="color: #495057; font-weight: 500; font-size: 15px;">{{phone}}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start; padding: 12px; background: #fef7f7; border-radius: 12px; border-left: 4px solid #ff8fa3;">
                        <span style="color: #a61e4d; font-weight: 600; min-width: 100px; font-size: 14px;">Address:</span>
                        <span style="color: #495057; font-weight: 500; font-size: 15px; flex: 1;">{{address}}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Details -->
        <div style="padding: 0 30px 20px;">
            <div style="background: #fff; border-radius: 20px; padding: 25px; box-shadow: 0 4px 16px rgba(255, 182, 193, 0.15); border: 1px solid #ffe0e6;">
                <h2 style="margin: 0 0 20px 0; color: #d63384; font-size: 22px; font-weight: 600; text-align: center;">
                    <span style="background: #ffe0e6; padding: 8px 20px; border-radius: 15px; display: inline-block;">Order Details</span>
                </h2>
                
                <!-- Order Summary -->
                <div style="background: #fef7f7; border-radius: 15px; padding: 20px; margin-bottom: 15px; border: 2px solid #ffe0e6;">
                    <h3 style="margin: 0 0 15px 0; color: #a61e4d; font-size: 18px; font-weight: 600; text-align: center;">Order Summary</h3>
                    <div style="background: #fff; border-radius: 12px; padding: 15px; color: #495057; font-size: 14px; line-height: 1.6; white-space: pre-line;">{{order_summary}}</div>
                </div>

                <!-- Pricing Information -->
                <div style="display: grid; gap: 12px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: linear-gradient(135deg, #ff8fa3 0%, #ff758f 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(255, 117, 143, 0.3);">
                        <span style="color: #fff; font-weight: 700; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">Total Amount:</span>
                        <span style="color: #fff; font-weight: 700; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">PKR {{total_amount}}</span>
                    </div>
                </div>

                <!-- Payment Information -->
                <div style="background: #fef7f7; border-radius: 15px; padding: 20px; margin-bottom: 15px; border: 2px solid #ffe0e6;">
                    <h3 style="margin: 0 0 15px 0; color: #a61e4d; font-size: 18px; font-weight: 600; text-align: center;">Payment Information</h3>
                    <div style="display: grid; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #fff; border-radius: 8px;">
                            <span style="color: #a61e4d; font-weight: 600; font-size: 13px;">Method:</span>
                            <span style="color: #495057; font-weight: 500; font-size: 14px;">{{payment_method}}</span>
                        </div>
                        <div style="background: #fff; border-radius: 8px; padding: 12px; color: #495057; font-size: 13px; line-height: 1.5;">{{payment_details}}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Status & Timeline -->
        <div style="padding: 0 30px 20px;">
            <div style="background: #fff; border-radius: 20px; padding: 25px; box-shadow: 0 4px 16px rgba(255, 182, 193, 0.15); border: 1px solid #ffe0e6;">
                <h2 style="margin: 0 0 20px 0; color: #d63384; font-size: 22px; font-weight: 600; text-align: center;">
                    <span style="background: #ffe0e6; padding: 8px 20px; border-radius: 15px; display: inline-block;">Order Status</span>
                </h2>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #fef7f7; border-radius: 10px;">
                        <span style="color: #a61e4d; font-weight: 600; font-size: 14px;">Status:</span>
                        <span style="background: #ff8fa3; color: #fff; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 12px; text-transform: uppercase;">{{status}}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #fef7f7; border-radius: 10px;">
                        <span style="color: #a61e4d; font-weight: 600; font-size: 14px;">Order Time:</span>
                        <span style="color: #495057; font-weight: 500; font-size: 13px;">{{timestamp}}</span>
                    </div>
                    <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 12px; padding: 15px; border: 2px solid #b8daff;">
                        <div style="text-align: center;">
                            <span style="color: #155724; font-weight: 600; font-size: 14px;">🚚 {{delivery_note}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Next Steps -->
        <div style="padding: 0 30px 20px;">
            <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 4px 16px rgba(40, 167, 69, 0.15);">
                <h2 style="margin: 0 0 15px 0; color: #155724; font-size: 20px; font-weight: 600;">What's Next?</h2>
                <div style="color: #155724; font-size: 14px; line-height: 1.6; font-weight: 500;">
                    {{thank_you_message}}
                </div>
                <div style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.8); border-radius: 12px;">
                    <div style="color: #0c5460; font-size: 13px; font-weight: 600;">
                        📍 Track Your Order: Use Order ID <strong>{{order_id}}</strong> on our website
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Information -->
        <div style="padding: 0 30px 30px;">
            <div style="background: linear-gradient(135deg, #ff8fa3 0%, #ff758f 100%); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 4px 16px rgba(255, 117, 143, 0.3);">
                <h2 style="margin: 0 0 15px 0; color: #fff; font-size: 20px; font-weight: 600; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">Contact Information</h2>
                <div style="display: grid; gap: 10px; color: #fff;">
                    <div style="font-size: 14px; font-weight: 500;">
                        <span style="opacity: 0.9;">Email:</span> 
                        <span style="font-weight: 600; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">{{contact_email}}</span>
                    </div>
                    <div style="font-size: 14px; font-weight: 500;">
                        <span style="opacity: 0.9;">Phone/WhatsApp:</span> 
                        <span style="font-weight: 600; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">{{contact_phone}}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #ffb3c1 0%, #ff8fa3 100%); padding: 25px; text-align: center; border-top: 3px solid #ff758f;">
            <div style="color: #fff; font-size: 18px; font-weight: 700; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                🌸 Phool Shop 🌸
            </div>
            <div style="color: #fff; font-size: 14px; font-weight: 500; opacity: 0.95; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                Handmade with Love, Delivered with Care 💕
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid rgba(255,255,255,0.3);">
                <div style="color: #fff; font-size: 12px; font-weight: 400; opacity: 0.9;">
                    This order confirmation was sent on {{timestamp}}. Save this email for your records.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

### Step 3: Update Environment Variable

1. **Copy your new Customer Template ID** from EmailJS
2. **Update your .env file**:
   ```env
   VITE_EMAILJS_CUSTOMER_TEMPLATE_ID=template_customer_confirm
   ```
   (Replace `template_customer_confirm` with your actual template ID)

### Step 4: Test the System

1. **Place a test order** on your website
2. **Check browser console** for:
   - `✅ Admin email sent successfully!`
   - `✅ Customer email sent successfully!`
3. **Check your email** (admin notification)
4. **Check customer's email** (order confirmation)

## 📋 **Customer Email Variables Available:**

- `{{to_email}}` - Customer's email address
- `{{to_name}}` - Customer's name
- `{{order_id}}` - Order ID (e.g., PS-ABC-123)
- `{{order_summary}}` - Order items summary
- `{{total_amount}}` - Total price (e.g., PKR 1000)
- `{{payment_method}}` - Payment method selected
- `{{payment_details}}` - Payment instructions
- `{{status}}` - Current order status
- `{{timestamp}}` - Order date/time
- `{{contact_email}}` - Shop contact email
- `{{contact_phone}}` - Shop contact phone
- `{{delivery_note}}` - Delivery information
- `{{shop_name}}` - Shop name (Phool Shop)
- `{{thank_you_message}}` - Thank you message

## 🎯 **For Custom Orders:**

Additional variables available:
- `{{custom_description}}` - Custom order description
- `{{custom_colors}}` - Preferred colors
- `{{custom_timeline}}` - Delivery timeline

## ✨ **Benefits:**

- **Professional customer experience** - Instant order confirmation
- **Reduced customer inquiries** - All details in email
- **Order tracking information** - Customers know how to track orders
- **Brand consistency** - Professional email template
- **Payment details included** - Clear payment instructions

## 🚨 **Important Notes:**

- Both emails are sent **simultaneously** in the background
- Order processing continues even if emails fail
- Check browser console for email delivery status
- Customer emails use the same EmailJS service and public key
- No additional costs - uses your existing EmailJS plan

Once you create the customer template in EmailJS and update the environment variable, your customers will receive beautiful order confirmation emails instantly! 🌸
