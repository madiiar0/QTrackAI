import styles from './LoadingState.module.css';

const LoadingState = ({ message = 'Loading your workspace...' }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
