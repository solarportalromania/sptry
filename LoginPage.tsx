
import React, { useState } from 'react';
import { useLanguage } from './components/LanguageContext';
import Button from './components/Button';
import Card from './components/Card';
import PasswordInput from './components/PasswordInput';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister, onNavigateToForgotPassword }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError(t('Invalid credentials, please try again.'));
      }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-2">{t('Welcome to SolarPortal')}</h2>
        <p className="text-center text-gray-400 mb-6">{t('Login to your account')}</p>
        
        {error && <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">{t('Email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 focus:ring-solar-green-400 focus:border-solar-green-400"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">{t('Password')}</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="text-right">
             <button type="button" onClick={onNavigateToForgotPassword} className="text-sm font-medium text-solar-green-400 hover:underline" disabled={isLoading}>
                {t('Forgot Password?')}
            </button>
          </div>
          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>{t('Login')}</Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>{t("Don't have an account?")} <button onClick={onNavigateToRegister} className="font-medium text-solar-green-400 hover:underline" disabled={isLoading}>{t('Create an account')}</button></p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
