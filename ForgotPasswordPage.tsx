

import React, { useState } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import { useLanguage } from './components/LanguageContext';
import PasswordInput from './components/PasswordInput';
import Icon from './components/Icon';
import PasswordStrengthIndicator, { isPasswordStrong } from './components/PasswordStrengthIndicator';

interface ForgotPasswordPageProps {
  onForgotPasswordRequest: (email: string) => Promise<string | true>;
  onVerifyResetCode: (code: string) => Promise<boolean>;
  onResetPassword: (password: string) => Promise<void>;
  onNavigateToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onForgotPasswordRequest,
  onVerifyResetCode,
  onResetPassword,
  onNavigateToLogin,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await onForgotPasswordRequest(email);
    if (result === true) {
      setStep('code');
    } else {
      setError(result);
    }
    setIsLoading(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const isValid = await onVerifyResetCode(code);
    if (isValid) {
      setStep('password');
    } else {
      setError(t('Invalid code.'));
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("New passwords don't match."));
      return;
    }
    if (!isPasswordStrong(password)) {
        setError(t('pw_requirements_not_met'));
        return;
    }
    setError('');
    setIsLoading(true);
    await onResetPassword(password);
    // The App component will handle showing a success message and navigating to login
    setIsLoading(false);
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-6">
      <p className="text-gray-400 text-center">{t('Enter the email address associated with your account.')}</p>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">{t('Email')}</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"
        />
      </div>
      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>{t('Reset Password')}</Button>
    </form>
  );

  const renderCodeStep = () => (
    <form onSubmit={handleCodeSubmit} className="space-y-6">
       <div className="text-center p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
        <p className="text-gray-300 mb-2">{t('We have sent a 4-digit code to your email. Please check your inbox (and spam folder).')}</p>
        <p className="text-sm text-yellow-300 font-semibold">{t('For demonstration purposes, the code is logged to the browser console.')}</p>
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">{t('Enter 4-digit Code')}</label>
        <input
          type="text"
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={4}
          className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2 text-center text-2xl tracking-[1rem]"
        />
      </div>
      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>{t('Confirm')}</Button>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-6">
      <p className="text-gray-400 text-center">{t('Please create a new, strong password.')}</p>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('New Password')}</label>
        <PasswordInput id="newPassword" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('Confirm New Password')}</label>
        <PasswordInput id="confirmNewPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      </div>
      <PasswordStrengthIndicator password={password} />
      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>{t('Save Changes')}</Button>
    </form>
  );

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">{t('Reset Password')}</h2>
        
        {error && <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-4 text-center">{error}</p>}

        {step === 'email' && renderEmailStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'password' && renderPasswordStep()}
        
        <div className="mt-6 text-center text-sm">
          <button onClick={onNavigateToLogin} className="font-medium text-solar-green-400 hover:underline">
            {t('Back to Login')}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;