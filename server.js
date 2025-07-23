// This server provides a secure backend for the SolarPortal application.
// It handles database interactions, API calls to Gemini, and email sending.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Resend } = require('resend');
const { GoogleGenAI, Type } = require("@google/genai");

const app = express();
const port = process.env.PORT || 3001;

// --- INITIALIZATION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const resend = new Resend(process.env.RESEND_API_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// --- MIDDLEWARE ---
app.use(cors({
  origin: ['https://your-frontend-domain.com'], // <-- update this!
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for image uploads

// A simple middleware to check for a secret header for some sensitive operations
const checkAdminSecret = (req, res, next) => {
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};


// --- API ENDPOINTS ---

// Gemini Feasibility Report
app.post('/api/analyze-feasibility', async (req, res) => {
    const { project, language, currencySymbol } = req.body;
    if (!project) {
        return res.status(400).json({ error: 'Project data is required.' });
    }
    try {
        const langInstructions = language === 'ro' ? "Provide all text values in Romanian." : "Provide all text values in English.";
        const prompt = `Analyze the following solar project details for a home in Romania. 
        Project data: 
        - Address: ${project.address.street}, ${project.address.city}, ${project.address.county}
        - Avg. Monthly Bill: ${project.energyBill} ${currencySymbol}
        - Roof Type: ${project.roofType}
        - Wants Battery: ${project.wantsBattery}
        - Notes: ${project.notes}
        
        Based on this, provide a concise feasibility report. The system size should be a range (e.g., '5-7 kWp') and production an annual estimate (e.g., '6,500-8,500 kWh'). The summary should be a short, encouraging paragraph. List 3-4 key benefits. ${langInstructions}`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                estimatedSystemSizeKw: { type: Type.STRING },
                estimatedAnnualProductionKwh: { type: Type.STRING },
                summary: { type: Type.STRING },
                potentialBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["estimatedSystemSizeKw", "estimatedAnnualProductionKwh", "summary", "potentialBenefits"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });
        
        const reportData = JSON.parse(response.text);
        res.json(reportData);
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate AI report.' });
    }
});

// Endpoint to fetch all necessary initial data for the app
app.get('/api/initial-data', async (req, res) => {
    try {
        const [
            projectsRes, homeownersRes, installersRes, adminsRes, 
            reviewsRes, blogPostsRes, roofTypesRes, equipmentBrandsRes, 
            panelModelsRes, inverterModelsRes, batteryModelsRes
        ] = await Promise.all([
            pool.query('SELECT p.*, (SELECT COALESCE(json_agg(q.*), \'[]\') FROM quotes q WHERE q."projectId" = p.id) as quotes FROM projects p ORDER BY p."createdAt" DESC'),
            pool.query('SELECT id, name, email, phone, status, "createdAt" FROM homeowners'),
            pool.query('SELECT id, name, "establishmentDate", "registrationNumber", "licenseNumber", "logoDataUrl", about, specialties, "serviceCounties", contact, status, "createdAt", portfolio FROM installers'),
            pool.query('SELECT id, name, email, status, role, "createdAt", permissions FROM admins'),
            pool.query('SELECT * FROM reviews ORDER BY "createdAt" DESC'),
            pool.query('SELECT * FROM blog_posts ORDER BY "createdAt" DESC'),
            pool.query('SELECT * FROM roof_types'),
            pool.query('SELECT * FROM equipment_brands'),
            pool.query('SELECT * FROM panel_models'),
            pool.query('SELECT * FROM inverter_models'),
            pool.query('SELECT * FROM battery_models'),
        ]);

        res.json({
            projects: projectsRes.rows,
            homeowners: homeownersRes.rows,
            installers: installersRes.rows,
            admins: adminsRes.rows,
            reviews: reviewsRes.rows,
            blogPosts: blogPostsRes.rows,
            roofTypes: roofTypesRes.rows,
            equipmentBrands: equipmentBrandsRes.rows,
            panelModels: panelModelsRes.rows,
            inverterModels: inverterModelsRes.rows,
            batteryModels: batteryModelsRes.rows,
            // These are not yet implemented on the backend, so we mock them
            conversations: [], 
            notifications: [],
            financialRecords: [],
            history: [],
            commissionRate: 0.10,
        });

    } catch (error) {
        console.error('Error fetching initial data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        let user;
        
        const homeownerRes = await pool.query('SELECT * FROM homeowners WHERE email = $1', [email.toLowerCase()]);
        if (homeownerRes.rows.length > 0) user = homeownerRes.rows[0];

        if (!user) {
            const installerRes = await pool.query("SELECT * FROM installers WHERE contact->>'email' = $1", [email.toLowerCase()]);
            if (installerRes.rows.length > 0) user = installerRes.rows[0];
        }

        if (!user) {
            const adminRes = await pool.query('SELECT * FROM admins WHERE email = $1', [email.toLowerCase()]);
            if (adminRes.rows.length > 0) user = adminRes.rows[0];
        }

        if (user && user.password === password) {
            const { password: _, ...userWithoutPassword } = user;
            res.json({ user: userWithoutPassword });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const sendVerificationEmail = async (email, code) => {
    try {
        await resend.emails.send({
            from: 'SolarPortal <onboarding@resend.dev>', // Replace with your verified domain in production
            to: email,
            subject: 'Your SolarPortal Verification Code',
            html: `<p>Welcome to SolarPortal! Your verification code is: <strong>${code}</strong></p>`,
        });
    } catch (error) {
        console.error(`Failed to send verification email to ${email}:`, error);
        // We don't throw here to avoid failing the whole registration process if email fails
    }
};

app.post('/api/register/homeowner', async (req, res) => {
    const { homeownerData, projectData } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const verificationExpires = new Date(Date.now() + 3600000); // 1 hour from now

        const homeownerId = `homeowner-${Date.now()}`;
        await client.query(
            'INSERT INTO homeowners (id, name, email, password, phone, status, verification_code, verification_expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [homeownerId, homeownerData.name, homeownerData.email.toLowerCase(), homeownerData.password, homeownerData.phone, 'PENDING_VERIFICATION', verificationCode, verificationExpires]
        );

        const projectId = `project-${Date.now()}`;
        await client.query(
            'INSERT INTO projects (id, "homeownerId", address, "energyBill", "roofType", notes, "wantsBattery", "photoDataUrl", status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [projectId, homeownerId, projectData.address, projectData.energyBill, projectData.roofType, projectData.notes, projectData.wantsBattery, projectData.photoDataUrl, 'PENDING_APPROVAL']
        );
        
        await client.query('COMMIT');

        // Send email after successful transaction
        await sendVerificationEmail(homeownerData.email, verificationCode);

        res.status(201).json({ message: 'Homeowner and project created successfully. Please verify email.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Homeowner registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

app.post('/api/register/installer', async (req, res) => {
    const { installerData } = req.body;
    const client = await pool.connect();
    try {
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const verificationExpires = new Date(Date.now() + 3600000); // 1 hour

        const installerId = `installer-${Date.now()}`;
        await client.query(
            `INSERT INTO installers (id, name, password, "establishmentDate", "registrationNumber", "licenseNumber", specialties, "serviceCounties", contact, status, verification_code, verification_expires, "logoDataUrl", about, portfolio) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, '', '', '{}')`,
            [installerId, installerData.name, installerData.password, installerData.establishmentDate, installerData.registrationNumber, installerData.licenseNumber, installerData.specialties, installerData.serviceCounties, installerData.contact, 'PENDING_VERIFICATION', verificationCode, verificationExpires]
        );

        await sendVerificationEmail(installerData.contact.email, verificationCode);
        
        res.status(201).json({ message: 'Installer created successfully. Please verify email.' });
    } catch (error) {
        console.error('Installer registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

app.post('/api/verify-email', async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ error: 'Email and code are required.' });
    }

    const client = await pool.connect();
    try {
        let userTable, updated = false;

        const homeownerRes = await client.query('SELECT * FROM homeowners WHERE email = $1', [email.toLowerCase()]);
        if (homeownerRes.rows.length > 0) {
            userTable = 'homeowners';
        } else {
            const installerRes = await client.query("SELECT * FROM installers WHERE contact->>'email' = $1", [email.toLowerCase()]);
            if (installerRes.rows.length > 0) {
                userTable = 'installers';
            }
        }

        if (userTable) {
             const result = await client.query(
                `UPDATE ${userTable} SET status = 'ACTIVE', verification_code = NULL, verification_expires = NULL 
                 WHERE ${userTable === 'homeowners' ? 'email' : "contact->>'email'"} = $1 AND verification_code = $2 AND verification_expires > NOW()`,
                [email.toLowerCase(), code]
            );

            if (result.rowCount > 0) {
                updated = true;
            }
        }

        if (updated) {
            res.status(200).json({ message: 'Email verified successfully.' });
        } else {
            res.status(400).json({ error: 'Invalid verification code or email.' });
        }
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});