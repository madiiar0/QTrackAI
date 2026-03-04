import { Link } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import styles from './AppHeader.module.css';

const AppHeader = () => {
  return (
    <header className={styles.header}>
      <Link className={styles.logoLink} to="/main-page">
        <img src="/SynapAI_Logo.png" alt="SynapAI" />
      </Link>
      <Link className={styles.profileButton} to="/dashboard" aria-label="Profile">
        <FiUser aria-hidden="true" />
      </Link>
    </header>
  );
};

export default AppHeader;
