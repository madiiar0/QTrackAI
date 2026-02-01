import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPages.module.css';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: 'info', message: '' });

    if (!email) {
      setStatus({ type: 'error', message: 'Email is required.' });
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword({ email });
    } catch (error) {
      // Deliberately hide account existence errors.
    } finally {
      setIsLoading(false);
      setStatus({
        type: 'success',
        message: 'If an account exists for that email, we will send a reset link shortly.',
      });
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will email you a secure reset link."
      showLogo={false}
      footer={
        <span>
          Remembered your password?{' '}
          <Link className={styles.link} to="/login">
            Back to sign in
          </Link>
        </span>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
        />
        <Alert variant={status.type}>{status.message}</Alert>
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
