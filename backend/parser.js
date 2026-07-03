import fs from 'fs';
import csv from 'csv-parser';

export function parseLeads(filePath) {
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            // For now, let's just log the Lead Number and its Source to confirm it reads
            console.log(`Lead #${row['Lead Number']}: Source is ${row['Lead Source'] || 'Unknown'}`);
        })
        .on('end', () => {
            console.log('CSV file successfully processed.');
        });
}