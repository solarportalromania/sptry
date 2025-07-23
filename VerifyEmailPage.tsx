
import React, { useState } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import { useLanguage } from './components/LanguageContext';

interface VerifyEmailPageProps {
  onVerify: (code: string) => Promise<boolean>;
}

const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onVerify }) => {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onVerify(code);
    if (!success) {
      setError(t('Invalid code.'));
    }
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">{t('Verify Your Email')}</h2>
        
        <div className="text-center p-4 bg-blue-900/50 border border-blue-700 rounded-lg mb-6">
          <p className="text-gray-300 mb-2">{t('verificationInstruction')}</p>
          <p className="text-sm text-yellow-300 font-semibold">{t('verificationConsoleHint')}</p>
        </div>
        
        {error && <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
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
          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>{t('Verify')}</Button>
        </form>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
