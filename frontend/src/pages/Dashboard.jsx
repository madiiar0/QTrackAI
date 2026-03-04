import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import AppHeader from '../components/AppHeader';
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
      <AppHeader />

      <main className={styles.content}>
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
            <h2>{user?.name || user?.email || 'SynapAI Member'}</h2>
            <p>{user?.email}</p>
            <span className={`${styles.badge} ${isVerified ? styles.verified : styles.pending}`}>
              {isVerified ? 'Verified account' : 'Pending verification'}
            </span>
          </div>
        </div>
        <div className={styles.infoCard}>
          <h3>Account info</h3>
          <div className={styles.infoRow}>
            <span>Email</span>
            <span>{user?.email || '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span>Status</span>
            <span>{isVerified ? 'Verified' : 'Pending verification'}</span>
          </div>
          <div className={styles.infoRow}>
            <span>Joined</span>
            <span>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
          <Button variant="secondary" onClick={handleLogout} className={styles.logoutButton}>
            Log out
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
