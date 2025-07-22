import { Project } from '../types';

// This URL will be replaced with your actual Render backend URL after deployment.
const RENDER_BACKEND_URL = 'https://solar-portal-backend-xxxx.onrender.com'; // Placeholder

export const generateFeasibilityReport = async (project: Project, language: 'ro' | 'en', currencySymbol: string): Promise<string> => {
  if (RENDER_BACKEND_URL.includes('xxxx')) {
      console.warn("Backend URL is a placeholder. Update it in services/geminiService.ts after deploying your backend on Render.")
  }
  
  try {
    const response = await fetch(`${RENDER_BACKEND_URL}/api/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project, language, currencySymbol }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Backend request failed');
    }

    const data = await response.json();
    return data.report;
  } catch (error) {
    console.error("Error fetching feasibility report from backend:", error);
    // Return a user-friendly error message
    return language === 'ro' 
      ? 'A apărut o eroare la comunicarea cu serverul. Vă rugăm să încercați din nou mai târziu.' 
      : 'An error occurred while communicating with the server. Please try again later.';
  }
};