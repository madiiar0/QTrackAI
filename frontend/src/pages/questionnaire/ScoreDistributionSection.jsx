import styles from '../Quiz.module.css';

const ScoreDistributionSection = () => {
  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Score distribution</h2>
        <p>Describe how points should be distributed across questions.</p>
      </div>
    </div>
  );
};

export default ScoreDistributionSection;
