import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', isLoading, ...props }) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${isLoading ? styles.loading : ''}`}
      {...props}
    >
      <span>{children}</span>
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    </button>
  );
};

export default Button;
