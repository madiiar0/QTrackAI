import styles from '../Quiz.module.css';

const TopicsSection = () => {
  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Topics</h2>
        <p>Define the topics that the exam should cover.</p>
      </div>
    </div>
  );
};

export default TopicsSection;
