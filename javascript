//Create form button
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🛒 Create Product Forms')
    .addItem('Generate Google Forms', 'createProductForms')
    .addToUi();
}

//Generate variations
function generateVariations(attributes) {
  const result = [];

  function recurse(index, currentCombo, currentPrice) {
    if (index === attributes.length) {
      result.push({ combination: [...currentCombo], totalModifier: currentPrice });
      return;
    }

    const attr = attributes[index];
    for (const option of attr.options) {
      currentCombo.push(option.value);
      recurse(index + 1, currentCombo, currentPrice + option.modifier);
      currentCombo.pop();
    }
  }

  recurse(0, [], 0);
  return result;
}

//Create form
function createProductForms() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const folders = DriveApp.getFoldersByName('Rental Booking');
  if (!folders.hasNext()) {
    throw new Error('Folder "Rental Booking" not found in Google Drive.');
  }
  const rentalFolder = folders.next();
  
  const responseSheetName = 'CL EVENT (Rental Products) [Response]';
  const files = DriveApp.getFilesByName(responseSheetName);
  let responseSpreadsheet;
  if (files.hasNext()) {
    responseSpreadsheet = SpreadsheetApp.open(files.next());
  } else {
    responseSpreadsheet = SpreadsheetApp.create(responseSheetName);
  }

  for (let row = 1; row < data.length; row++) {
    const productRow = data[row];
    const productName = productRow[0];
    const basePrice = parseFloat(productRow[1]);
    const formUrl = productRow[headers.length - 1];
    if (formUrl) continue;

    const attributes = [];
    for (let i = 2; i < headers.length - 1; i += 2) {
      const attrName = productRow[i];
      const attrValuesRaw = productRow[i + 1];
      if (!attrName || !attrValuesRaw) continue;

      const options = attrValuesRaw.split(',').map(s => {
        const [val, price] = s.split(':');
        return { value: val.trim(), modifier: parseFloat(price.trim()) };
      });

      attributes.push({ name: attrName, options });
    }

    const variations = generateVariations(attributes);
    const form = FormApp.create(`${productName} Order Form`);
    const file = DriveApp.getFileById(form.getId());
    rentalFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    form.setTitle(`${productName} Order Form`);

    // Control navigation1
    const introPage = form.addPageBreakItem().setTitle('Welcome to the Order Form');
  
    // Create Customer Details section
    const customerDetailsPageBreak = form.addPageBreakItem().setTitle('Customer Details');

    // Customer Details Fields
      // Add the product name (fixed)
      const productNameField = form.addMultipleChoiceItem()
        .setTitle('Product Name')
        .setChoiceValues([productName])
        .setRequired(true);
    form.addTextItem().setTitle('Customer Name').setRequired(true);
    form.addTextItem().setTitle('IC Number (12 digits)').setRequired(true)
      .setValidation(FormApp.createTextValidation()
        .requireTextMatchesPattern('^\\d{12}$')
        .setHelpText('IC must be exactly 12 digits.').build());
    form.addListItem().setTitle('Pick-up Store')
      .setChoiceValues(['OneJaya', 'MetroCity'])
      .setRequired(true);
    form.addDateItem().setTitle('Rental Start Date').setRequired(true);
    form.addDateItem().setTitle('Rental End Date').setRequired(true);
    form.addDateItem().setTitle('Pick-up Date').setRequired(true);
    form.addListItem().setTitle('Pick-up Time')
      .setChoiceValues(['12.00pm', '12.30pm', '1.00pm', '1.30pm', '2.00pm', '2.30pm', '3.00pm', '3.30pm', '4.00pm', '4.30pm', '5.00pm', '5.30pm', '6.00pm'])
      .setRequired(true);
    form.addDateItem().setTitle('Return Date').setRequired(true);
    form.addListItem().setTitle('Return Time')
      .setChoiceValues(['10.00am', '10.30am', '11.00am', '11.30am', '12.00pm'])
      .setRequired(true);

    // Control navigation2
    const introPage2 = form.addPageBreakItem().setTitle('Welcome to the Order Form');

    // Product Variation Pages
    for (let i = 0; i < 10; i++) {
      form.addPageBreakItem().setTitle(`Item #${i + 1}`);

      // Add variation selector
      const variationItem = form.addListItem()
        .setTitle(`Select variation for ${productName} #${i + 1}`)
        .setChoiceValues(
          variations.map(v => `${v.combination.join(' + ')} (RM${(basePrice + v.totalModifier).toFixed(2)})`)
        );
      if (i === 0) variationItem.setRequired(true);

      // Add quantity input
      const quantityItem = form.addTextItem().setTitle('Enter quantity');
      if (i === 0) quantityItem.setRequired(true);

      // Add 'add more items?' question
      const addMore = form.addMultipleChoiceItem().setTitle('Do you want to add more items?');
      if (i === 0) addMore.setRequired(true);
      const choices = [
        addMore.createChoice('No', customerDetailsPageBreak),
      ];
      if (i < 9) {
        choices.unshift(addMore.createChoice('Yes', FormApp.PageNavigationType.CONTINUE));
      }
      addMore.setChoices(choices);
    }

    // Booking ID section
    const bookingPageBreak = form.addPageBreakItem()
      .setTitle('Booking ID Section')
      .setHelpText('Please screenshot your booking ID and WhatsApp to CL Events after submitting the form.');
    form.addTextItem().setTitle('Booking ID')
      .setHelpText('Last 4 digits of phone number + booking datetime\n\nExample:\nPhone number = 0899\nDate = 070525 (DDMMYY)\nTime = 1430 (MMSS)\nID = 08990705251430')
      .setValidation(FormApp.createTextValidation()
        .requireTextMatchesPattern('^\\d{14}$')
        .setHelpText('It must be exactly 14 digits.').build())
      .setRequired(true);
    
    // Navigation rules
      // Form Title → Product Variation 1
      introPage.setGoToPage(form.getItems(FormApp.ItemType.PAGE_BREAK)[3].asPageBreakItem()); 

      // Customer Details → Booking ID Section
      introPage2.setGoToPage(bookingPageBreak);

    //Set confirmation message
    form.setConfirmationMessage("Please WhatsApp your booking ID to https://api.whatsapp.com/send?phone=601112636367 to check your order.");

    // Link form responses
      form.setDestination(FormApp.DestinationType.SPREADSHEET, responseSpreadsheet.getId());
      sheet.getRange(row + 1, headers.length).setValue(form.getEditUrl());
    }
}

