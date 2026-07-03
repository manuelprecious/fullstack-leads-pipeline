import express from 'express';
import { parseLeads } from './parser.js'; // Import our new parser function

const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: "healthy", message: "Backend is running smoothly" });
});

// New route to trigger the CSV data parsing
app.post('/import-leads', (req, res) => {
  const filePath = '../raw_leads.csv';
  
  parseLeads(filePath);
  
  res.json({ message: "Lead ingestion started in the background." });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});