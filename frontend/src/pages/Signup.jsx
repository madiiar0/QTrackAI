import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { normalizeError } from '../utils/normalizeError';
import styles from './AuthPages.module.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setStatus({ type: 'info', message: '' });

    const newErrors = {};
    if (!formValues.name) newErrors.name = 'Name is required.';
    if (!formValues.email) newErrors.email = 'Email is required.';
    if (!formValues.password) newErrors.password = 'Password is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      await signup(formValues);
      navigate('/verify-email', {
        state: {
          message: 'We sent a 6-digit code to your email. Enter it to verify your account.',
        },
      });
    } catch (error) {
      setStatus({ type: 'error', message: normalizeError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="SynapAI keeps your learning analytics sharp and secure."
      showLogo={false}
      footer={
        <span>
          Already have an account?{' '}
          <Link className={styles.link} to="/login">
            Sign in
          </Link>
        </span>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextInput
          label="Full name"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          placeholder="Alex Morgan"
          autoComplete="name"
          error={errors.name}
        />
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
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password}
        />
        <Alert variant={status.type}>{status.message}</Alert>
        <div className={styles.actions}>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            Create account
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
