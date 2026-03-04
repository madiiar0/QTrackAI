import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', isLoading, className = '', ...props }) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${isLoading ? styles.loading : ''} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    </button>
  );
};

export default Button;
