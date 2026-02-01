import styles from './TextInput.module.css';

const TextInput = ({ label, error, helper, ...props }) => {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
      {error ? <span className={styles.error}>{error}</span> : null}
      {!error && helper ? <span className={styles.helper}>{helper}</span> : null}
    </label>
  );
};

export default TextInput;
