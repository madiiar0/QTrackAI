import styles from './Alert.module.css';

const Alert = ({ variant = 'info', children }) => {
  if (!children) return null;
  return (
    <div className={`${styles.alert} ${styles[variant]}`} role="status">
      {children}
    </div>
  );
};

export default Alert;
