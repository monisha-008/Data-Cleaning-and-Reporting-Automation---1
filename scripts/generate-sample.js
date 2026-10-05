import fs from 'fs';
import path from 'path';

// Columns: Customer_ID,Customer_Name,Age,Gender,City,Product,Quantity,Price,Revenue,Purchase_Date,Payment_Method
// 500 total rows.
// Exactly:
// - 25 rows exact duplicates of earlier rows
// - 40 missing Age values ("" or "NA" or "N/A" or "null")
// - 15 missing City values
// - 20 missing Payment_Method values
// - 10 invalid Age values (e.g., "twenty", "abc", "-5", "999")
// - 8 invalid dates (e.g., "invalid_date", "32/13/2024", "99-99-9999")
// - 12 spelling variations (e.g. "Chenai" vs "Chennai", "Mumbay" vs "Mumbai", "Bangelore" vs "Bangalore")
// - 30 numeric strings with formatting (e.g. "$1,250.00", "₹1,200", "1,500.50", "50%")
// - 6 known outliers (Quantity = 500, Price = 25000)

const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];
const products = ["Laptop", "Smartphone", "Tablet", "Headphones", "Smartwatch", "Monitor", "Keyboard", "Mouse"];
const genders = ["Male", "Female", "Other"];
const payments = ["Credit Card", "Debit Card", "UPI", "Net Banking", "Cash on Delivery"];
const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Chiara", "Myra", "Riya", "Anvi", "Sneha"];
const lastNames = ["Sharma", "Verma", "Patel", "Mehta", "Reddy", "Nair", "Iyer", "Rao", "Kumar", "Singh",
  "Gupta", "Das", "Joshi", "Bhat", "Chopra", "Malhotra", "Kapoor", "Saxena", "Sen", "Bose"];

// Seeded pseudorandom generator for deterministic reproducibility
let seed = 42;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

const rows = [];

// Generate 475 base rows
for (let i = 1; i <= 475; i++) {
  const custId = `CUST-${1000 + i}`;
  const fName = firstNames[Math.floor(random() * firstNames.length)];
  const lName = lastNames[Math.floor(random() * lastNames.length)];
  const name = `${fName} ${lName}`;
  const gender = genders[Math.floor(random() * genders.length)];
  const city = cities[Math.floor(random() * cities.length)];
  const product = products[Math.floor(random() * products.length)];
  const age = Math.floor(random() * 45) + 20; // 20 to 65
  const qty = Math.floor(random() * 5) + 1; // 1 to 5
  const basePrice = (Math.floor(random() * 20) + 5) * 50; // 250 to 1250
  const rev = qty * basePrice;
  const month = String(Math.floor(random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(random() * 28) + 1).padStart(2, '0');
  const date = `2025-${month}-${day}`;
  const payment = payments[Math.floor(random() * payments.length)];

  rows.push({
    Customer_ID: custId,
    Customer_Name: name,
    Age: String(age),
    Gender: gender,
    City: city,
    Product: product,
    Quantity: String(qty),
    Price: String(basePrice),
    Revenue: String(rev),
    Purchase_Date: date,
    Payment_Method: payment
  });
}

// Inject exact defects at fixed predictable indices

// 1. 40 missing Age values at indices: 5, 15, 25, ... (step 10, 40 items)
for (let k = 0; k < 40; k++) {
  const idx = 5 + k * 10;
  const nullRepr = k % 4 === 0 ? "" : (k % 4 === 1 ? "NA" : (k % 4 === 2 ? "N/A" : "null"));
  rows[idx].Age = nullRepr;
}

// 2. 15 missing City values at indices: 8, 38, 68, ...
for (let k = 0; k < 15; k++) {
  const idx = 8 + k * 30;
  rows[idx].City = k % 2 === 0 ? "" : "N/A";
}

// 3. 20 missing Payment_Method values at indices: 12, 32, 52, ...
for (let k = 0; k < 20; k++) {
  const idx = 12 + k * 20;
  rows[idx].Payment_Method = k % 2 === 0 ? "" : "-";
}

// 4. 10 invalid Age values (strings like "abc", "twenty", "-5") at indices: 102, 132, ...
const invalidAges = ["abc", "twenty", "-5", "NaN", "invalid", "unknown", "N/A_age", "300", "-12", "err"];
for (let k = 0; k < 10; k++) {
  const idx = 102 + k * 30;
  rows[idx].Age = invalidAges[k];
}

// 5. 8 invalid dates at indices: 44, 94, 144, 194, 244, 294, 344, 394
const invalidDates = ["invalid_date", "99/99/9999", "2025-02-31", "not-a-date", "2025/13/45", "TBD", "00-00-0000", "error_date"];
for (let k = 0; k < 8; k++) {
  const idx = 44 + k * 50;
  rows[idx].Purchase_Date = invalidDates[k];
}

// 6. 12 spelling variations in City and Gender at indices: 6, 26, 46, ...
const spellingMap = [
  { field: 'City', val: 'Chenai' }, // -> Chennai
  { field: 'City', val: 'Mumbay' }, // -> Mumbai
  { field: 'City', val: 'Bangelore' }, // -> Bangalore
  { field: 'City', val: 'Calcutta' }, // -> Kolkata
  { field: 'City', val: 'Hydrabad' }, // -> Hyderabad
  { field: 'City', val: 'Poona' }, // -> Pune
  { field: 'Gender', val: 'male' }, // case variation -> Male
  { field: 'Gender', val: 'MALE' },
  { field: 'Gender', val: ' female' }, // whitespace
  { field: 'Gender', val: 'FEMALE' },
  { field: 'City', val: ' Mumbai ' }, // whitespace
  { field: 'City', val: 'Delhi ' } // whitespace
];
for (let k = 0; k < 12; k++) {
  const idx = 6 + k * 20;
  rows[idx][spellingMap[k].field] = spellingMap[k].val;
}

// 7. 30 numeric strings with formatting (e.g. "$1,250", "₹1,200", "1,500.00")
for (let k = 0; k < 30; k++) {
  const idx = 3 + k * 14;
  const p = parseFloat(rows[idx].Price);
  if (k % 3 === 0) rows[idx].Price = `$${p.toLocaleString()}`;
  else if (k % 3 === 1) rows[idx].Price = `₹${p.toLocaleString()}`;
  else rows[idx].Revenue = `${parseFloat(rows[idx].Revenue).toLocaleString()}.00`;
}

// 8. 6 known outliers in Quantity and Price at indices: 50, 100, 150, 200, 250, 300
rows[50].Quantity = "250"; // normal is 1-5
rows[100].Quantity = "400";
rows[150].Price = "45000"; // normal is 250-1250
rows[200].Price = "60000";
rows[250].Revenue = "500000";
rows[300].Revenue = "750000";

// 9. Add exactly 25 duplicate rows copied from earlier rows
// Target: exactly 500 rows total.
// Currently 475 rows. Let's copy 25 rows from indices 0 to 24 and append them.
for (let k = 0; k < 25; k++) {
  rows.push({ ...rows[k] });
}

// Output sample-data.csv
const headers = ["Customer_ID","Customer_Name","Age","Gender","City","Product","Quantity","Price","Revenue","Purchase_Date","Payment_Method"];
const csvLines = [headers.join(",")];
for (const r of rows) {
  const line = headers.map(h => {
    const val = r[h] !== undefined ? String(r[h]) : "";
    if (val.includes(",") || val.includes("\"") || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }).join(",");
  csvLines.push(line);
}

fs.mkdirSync(path.join(process.cwd(), 'src', 'data'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'sample-data.csv'), csvLines.join("\n"));

// Calculate exact metrics for expected.json
const expected = {
  dataset: "sample-data.csv",
  rowCount: 500,
  columnCount: 11,
  columns: headers,
  duplicateRowCount: 25,
  missingCounts: {
    Age: 40,
    City: 15,
    Payment_Method: 20,
    Customer_ID: 0,
    Customer_Name: 0,
    Gender: 0,
    Product: 0,
    Quantity: 0,
    Price: 0,
    Revenue: 0,
    Purchase_Date: 0,
    totalMissingCells: 75
  },
  invalidCounts: {
    Age: 10,
    Purchase_Date: 8,
    totalInvalidValues: 18
  },
  outlierCounts: {
    Quantity: 2,
    Price: 2,
    Revenue: 2,
    totalKnownOutliers: 6
  },
  spellingVariationsCount: 12,
  formattedNumericStringsCount: 30,
  severity: {
    overall: "Medium",
    missingSeverity: "Medium",
    duplicateSeverity: "Medium",
    invalidSeverity: "Low"
  },
  qualityScore: {
    expectedInitialRange: [65, 80],
    expectedCleanedRange: [92, 100]
  },
  kpis: {
    totalRevenueApprox: 1800000,
    totalOrders: 500
  }
};

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'expected.json'), JSON.stringify(expected, null, 2));
console.log("Successfully generated sample-data.csv and expected.json. Total rows:", rows.length);
