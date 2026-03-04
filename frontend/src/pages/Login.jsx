import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { normalizeError } from '../utils/normalizeError';
import styles from './AuthPages.module.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'info', message: location.state?.message || '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setStatus({ type: 'info', message: '' });

    if (!formValues.email || !formValues.password) {
      setErrors({
        email: !formValues.email ? 'Email is required.' : '',
        password: !formValues.password ? 'Password is required.' : '',
      });
      return;
    }

    try {
      setIsLoading(true);
      await login({ email: formValues.email, password: formValues.password });
      navigate('/dashboard');
    } catch (error) {
      setStatus({ type: 'error', message: normalizeError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your SynapAI workspace."
      showLogo={false}
      footer={
        <span>
          New to SynapAI?{' '}
          <Link className={styles.link} to="/signup">
            Create an account
          </Link>
        </span>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          type="email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          placeholder="you@gmail.com"
          autoComplete="email"
          error={errors.email}
        />
        <TextInput
          label="Password"
          type="password"
          name="password"
          value={formValues.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
        />
        <Alert variant={status.type}>{status.message}</Alert>
        <div className={styles.row}>
          <Link className={styles.link} to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <div className={styles.actions}>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            Sign in
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
