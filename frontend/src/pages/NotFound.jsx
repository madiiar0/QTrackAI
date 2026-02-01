import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import styles from './AuthPages.module.css';

const NotFound = () => {
  return (
    <AuthLayout
      title="Page not found"
      subtitle="Let’s get you back to a safe place."
      footer={
        <span>
          <Link className={styles.link} to="/login">
            Go to sign in
          </Link>
        </span>
      }
    >
      <p className={styles.helperText}>
        The page you were looking for doesn’t exist or has moved.
      </p>
    </AuthLayout>
  );
};

export default NotFound;
