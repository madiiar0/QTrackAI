import { FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import Button from '../components/Button';
import styles from './MainPage.module.css';

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.background} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobOne}`} />
        <div className={`${styles.blob} ${styles.blobTwo}`} />
        <div className={`${styles.blob} ${styles.blobThree}`} />
        <div className={`${styles.blob} ${styles.blobFour}`} />
        <div className={`${styles.blob} ${styles.blobFive}`} />
      </div>
      <main className={styles.main}>
        <div className={styles.actions}>
          <div className={styles.row}>
            <Button className={styles.startButton} onClick={() => navigate('/questionnaire')}>
              Generate an Exam
            </Button>
            <Button className={styles.collectionButton} onClick={() => navigate('/collection')}>
              Collections
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainPage;
