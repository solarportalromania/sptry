const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config(); // For local development with a .env file

const app = express();
const port = process.env.PORT || 3001; // Render provides the PORT env var

// --- Middleware ---
// Configure CORS to allow requests from your frontend's domain
// In production, you should restrict this to your actual frontend URL for security
app.use(cors()); 
app.use(express.json()); // To parse JSON bodies

// --- Gemini AI Setup ---
const apiKey = process.env.API_KEY;
let ai;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.error("CRITICAL: API_KEY environment variable not set. The /api/generate-report endpoint will not work.");
}

// --- API Routes ---
app.get('/', (req, res) => {
    res.send('SolarPortal Backend is running!');
});

app.post('/api/generate-report', async (req, res) => {
    if (!ai) {
        return res.status(500).json({ error: 'The AI service is not configured on the server. An API key is required.' });
    }

    try {
        const { project, language, currencySymbol } = req.body;
        if (!project || !language || !currencySymbol) {
            return res.status(400).json({ error: 'Missing required fields (project, language, currencySymbol) in request body.' });
        }

        const promptTemplates = {
            en: `As a solar energy expert, analyze the following home project details and provide a brief, encouraging, and realistic feasibility report for the homeowner. The report should be a single paragraph (3-5 sentences). IMPORTANT: The entire response MUST be in English. Include: An estimation of a suitable solar system size in kW based on their monthly bill. An estimated potential annual energy production in kWh. A brief mention of potential benefits. Project Details: Address: {fullAddress}, Average Monthly Electricity Bill: {currencySymbol}{energyBill}, Roof Type: {roofType}, Homeowner Notes: "{notes}"`,
            ro: `În calitate de expert în energie solară, analizează detaliile următoare ale proiectului și oferă un raport de fezabilitate scurt, încurajator și realist pentru proprietar. Raportul ar trebui să fie un singur paragraf (3-5 propoziții). IMPORTANT: Întregul răspuns TREBUIE să fie în limba Română. Include: O estimare a unei dimensiuni potrivite pentru sistemul solar în kW, bazată pe factura lunară. O estimare a producției anuale de energie în kWh. O mențiune scurtă a beneficiilor potențiale. Detalii Proiect: Adresă: {fullAddress}, Factura medie lunară la electricitate: {energyBill} {currencySymbol}, Tip acoperiș: {roofType}, Notițe proprietar: "{notes}"`,
        };

        const fullAddress = `${project.address.street}, ${project.address.city}, ${project.address.county}`;
        
        const prompt = promptTemplates[language]
            .replace('{fullAddress}', fullAddress)
            .replace('{currencySymbol}', currencySymbol)
            .replace('{energyBill}', String(project.energyBill))
            .replace('{roofType}', project.roofType)
            .replace('{notes}', project.notes || (language === 'ro' ? 'Niciuna' : 'None'));

        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        
        res.json({ report: response.text });

    } catch (error) {
        console.error('Error in /api/generate-report:', error);
        res.status(500).json({ error: 'Failed to generate report from AI service.' });
    }
});


// --- Start server ---
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
