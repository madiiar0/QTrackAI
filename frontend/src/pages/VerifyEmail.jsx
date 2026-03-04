import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import OtpInput from '../components/OtpInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { normalizeError } from '../utils/normalizeError';
import styles from './AuthPages.module.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, isVerified, logout } = useAuth();

  const [code, setCode] = useState('');
  const [status, setStatus] = useState({
    type: 'info',
    message: location.state?.message || 'Enter the 6-digit code to verify your email.',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVerified) {
      navigate('/dashboard');
    }
  }, [isVerified, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: 'info', message: '' });

    if (code.length !== 6) {
      setStatus({ type: 'error', message: 'Enter the full 6-digit code.' });
      return;
    }

    try {
      setIsLoading(true);
      await verifyEmail({ code });
      navigate('/dashboard');
    } catch (error) {
      setStatus({ type: 'error', message: normalizeError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenterEmail = async (event) => {
    event.preventDefault();
    try {
      await logout();
    } finally {
      navigate('/signup');
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Secure your SynapAI account in seconds."
      showLogo={false}
      footer={
        <span className={styles.helperText}>
          Didn&apos;t receive a code? Check your spam folder.
        </span>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <OtpInput value={code} onChange={setCode} />
        <Alert variant={status.type}>{status.message}</Alert>
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          Verify email
        </Button>
      </form>
      <div className={styles.center}>
        <span className={styles.helperText}>
          Entered the wrong email?{' '}
          <Link className={styles.link} to="/signup" onClick={handleReenterEmail}>
            Re-enter email
          </Link>
        </span>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
