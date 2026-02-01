import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isVerified } = useAuth();

  const initials = useMemo(() => {
    if (!user?.name) return 'QA';
    return user.name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/QTrackAI_Logo.png" alt="QTrackAI" />
          <div>
            <p className={styles.brandTitle}>QTrackAI</p>
            <p className={styles.brandSubtitle}>Secure analytics dashboard</p>
          </div>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </header>

      {!isVerified ? (
        <div className={styles.banner}>
          <p>
            Your email is not verified yet. Verify to unlock full access.
          </p>
          <Link className={styles.bannerLink} to="/verify-email">
            Verify email
          </Link>
        </div>
      ) : null}

      <div className={styles.card}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.details}>
          <h2>{user?.name || 'QTrackAI Member'}</h2>
          <p>{user?.email}</p>
          <span className={`${styles.badge} ${isVerified ? styles.verified : styles.pending}`}>
            {isVerified ? 'Verified account' : 'Pending verification'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
