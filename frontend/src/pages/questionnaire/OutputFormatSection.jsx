import styles from '../Quiz.module.css';

const OutputFormatSection = () => {
  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Output Format</h2>
        <p>Choose how the exam should be generated and delivered.</p>
      </div>
    </div>
  );
};

export default OutputFormatSection;
