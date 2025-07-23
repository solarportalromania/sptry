import { Project, FeasibilityReport } from '../types';

declare global {
    interface Window {
        process: {
            env: {
                REACT_APP_API_URL: string;
            }
        }
    }
}

const API_URL = window.process?.env?.REACT_APP_API_URL || '';

export const generateFeasibilityReport = async (
    project: Omit<Project, 'id' | 'homeownerId' | 'quotes' | 'status' | 'createdAt' | 'reviewSubmitted'>,
    language: 'ro' | 'en', 
    currencySymbol: string
): Promise<FeasibilityReport | { error: string }> => {
  if (!API_URL) {
    const errorMsg = language === 'ro'
      ? 'Serviciul API nu este configurat.'
      : 'API service is not configured.';
    console.error(errorMsg);
    return { error: errorMsg };
  }
  
  try {
    const response = await fetch(`${API_URL}/api/analyze-feasibility`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project, language, currencySymbol }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const reportData = await response.json();
    return reportData as FeasibilityReport;

  } catch (error) {
    console.error("Error fetching feasibility report from backend:", error);
    const errorMsg = language === 'ro' 
      ? 'A apărut o eroare la generarea raportului. Vă rugăm să încercați din nou mai târziu.' 
      : 'An error occurred while generating the report. Please try again later.';
    return { error: errorMsg };
  }
};
