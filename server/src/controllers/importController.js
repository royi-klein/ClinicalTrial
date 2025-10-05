import db from '../db.js';
import fs from 'fs/promises';

export async function importCSV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const csvContent = await fs.readFile(req.file.path, 'utf-8');
    
    // Parse CSV properly - handle quoted fields with commas
    const lines = csvContent.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    
    let imported = 0;
    let errors = [];

    console.log('CSV Headers:', headers);

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        if (values.length === 0 || !values[0]) continue; // Skip empty lines
        
        const issue = {};
        headers.forEach((header, index) => {
          issue[header] = values[index] ? values[index].trim() : null;
        });

        console.log('Importing issue:', issue);

        // Insert into database
        await db.query(
          `INSERT INTO issues (title, description, site, severity, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            issue.title,
            issue.description,
            issue.site || null,
            issue.severity || 'minor',
            issue.status || 'open',
            issue.createdAt ? new Date(issue.createdAt) : new Date()
          ]
        );

        imported++;
      } catch (error) {
        console.error(`Error on line ${i + 1}:`, error.message);
        errors.push({ line: i + 1, error: error.message });
      }
    }

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      message: `Successfully imported ${imported} issues`,
      imported,
      total: lines.length - 1,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import CSV',
      message: error.message
    });
  }
}

// Proper CSV parser that handles quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current);
  
  return result;
}