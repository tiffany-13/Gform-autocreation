# Gform-autocreation
# CL Event Rental Product Form Generator

This Google Apps Script automates the creation of customized Google Forms for each rental product listed in a Google Sheet. Each form includes detailed fields for product variations, quantities, customer information, rental schedule, and booking ID confirmation. Once created, each form is saved in a designated Google Drive folder and responses are linked to a central Google Sheet for tracking.

## ✨ Features

- Generates one Google Form per product listed in the sheet.
- Allows up to 10 product variations with price modifiers.
- Includes dynamic navigation based on item count.
- Collects customer details (name, IC number, store location, pickup/return date & time).
- Collects a 14-digit Booking ID with validation.
- Confirmation message includes a WhatsApp link to send the booking ID.
- Automatically stores forms in a specified "Rental Booking" folder in Google Drive.
- Saves responses to a shared response spreadsheet.

## 📂 Folder and File Structure

- **Rental Booking Folder (Google Drive)** – All generated Google Forms are stored here.
- **CL EVENT (Rental Products) [Response] (Google Sheet)** – Centralized form response collector.

## 📝 Spreadsheet Format (Input Sheet)

| Product Name | Base Price | Attribute 1 | Values 1 | Attribute 2 | Values 2 | ... | Form URL |
|--------------|------------|-------------|----------|-------------|----------|-----|----------|
| Balloon Set A | 30.00     | Color       | Red:0,Blue:2 | Size      | Small:0,Large:5 | ... | (auto-filled) |

- Product attributes and their values should be in alternating columns.
- Each value can have a price modifier (`Value:Modifier`).
- The last column will store the generated form edit URL.

## ✅ How to Use

1. Open the Google Sheet containing your product list.
2. Open **Extensions > Apps Script** and paste the script.
3. Save and reload the spreadsheet.
4. Use the new custom menu `🛒 Create Product Forms > Generate Google Forms` to create your forms.

## ⚠️ Requirements

- A Google Drive folder named `Rental Booking` must exist.
- Your Google Sheet must be correctly formatted (see example above).
- Make sure pop-ups and redirects are allowed for form confirmation links.

## 📩 Notes

- Confirmation message contains a WhatsApp API link for users to send their Booking ID.
- The script auto-generates pages per product variation and stops asking after the user selects "No" for adding more items.

## 💡 Customization

You can update:
- WhatsApp phone number in the confirmation message.
- Time options for pickup and return.
- Input validations (e.g., IC number or Booking ID format).

## 🛠 Technologies Used

- Google Apps Script
- Google Forms
- Google Sheets
- Google Drive

---

© 2025 CL Events & All in Blooms. Script maintained by Tiffany Lee.
