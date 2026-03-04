import styles from '../Quiz.module.css';

const TopicDifficultySection = () => {
  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Topic and difficulty distribution</h2>
        <p>Allocate how many questions should appear by topic and difficulty.</p>
      </div>
    </div>
  );
};

export default TopicDifficultySection;
