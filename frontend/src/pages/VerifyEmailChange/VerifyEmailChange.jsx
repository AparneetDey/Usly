import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckIcon, WarningIcon, ArrowRightIcon } from '../../components/icons/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Card from '../../components/ui/Card/Card.jsx';
import Button from '../../components/ui/Button/Button.jsx';
import Loader from '../../components/ui/Loader/Loader.jsx';
import authService from '../../services/auth.service.js';

const VerifyEmailChange = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { updateUser } = useAuth();

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setErrorMessage('No verification token provided in URL.');
        setVerifying(false);
        return;
      }

      try {
        const updatedUserData = await authService.verifyEmailChange(token);
        updateUser(updatedUserData);
        setUpdatedEmail(updatedUserData.email);
        setSuccess(true);
      } catch (err) {
        setErrorMessage(err.message || 'This verification link is invalid or has expired.');
      } finally {
        setVerifying(false);
      }
    };

    doVerify();
  }, [token]);

  return (
    <PageContainer>
      <div className="max-w-md mx-auto py-8">
        {verifying ? (
          <Loader message="Verifying your new email address..." />
        ) : success ? (
          <Card className="p-8 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 text-primary flex items-center justify-center">
              <CheckIcon size={28} />
            </div>
            <h2 className="text-xl font-bold text-text">Email Address Updated!</h2>
            <p className="text-sm text-muted max-w-xs">
              Your Usly account now uses: <strong>{updatedEmail}</strong>
            </p>
            <div className="pt-4">
              <Link to="/settings">
                <Button variant="primary">
                  <span>Go to Settings</span>
                  <ArrowRightIcon size={16} />
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-highlight/10 text-highlight flex items-center justify-center">
              <WarningIcon size={28} />
            </div>
            <h2 className="text-xl font-bold text-text">Verification Failed</h2>
            <p className="text-sm text-muted max-w-xs">
              {errorMessage}
            </p>
            <div className="pt-4">
              <Link to="/settings">
                <Button variant="secondary">
                  <span>Back to Settings</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default VerifyEmailChange;
