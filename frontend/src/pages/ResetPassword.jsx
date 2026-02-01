import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { normalizeError } from '../utils/normalizeError';
import styles from './AuthPages.module.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [formValues, setFormValues] = useState({
    password: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: 'info', message: '' });

    if (!token) {
      setStatus({ type: 'error', message: 'Reset token is missing.' });
      return;
    }

    if (!formValues.password) {
      setStatus({ type: 'error', message: 'Password is required.' });
      return;
    }

    if (formValues.confirmPassword && formValues.password !== formValues.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(token, { password: formValues.password });
      setStatus({ type: 'success', message: 'Password updated. Please sign in.' });
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      setStatus({ type: 'error', message: normalizeError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a secure password to protect your account."
      footer={
        <span>
          <Link className={styles.link} to="/login">
            Back to sign in
          </Link>
        </span>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextInput
          label="New password"
          type="password"
          name="password"
          value={formValues.password}
          onChange={handleChange}
          placeholder="Enter new password"
          autoComplete="new-password"
        />
        <TextInput
          label="Confirm password"
          type="password"
          name="confirmPassword"
          value={formValues.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          autoComplete="new-password"
          helper="Optional but recommended for safety."
        />
        <Alert variant={status.type}>{status.message}</Alert>
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
