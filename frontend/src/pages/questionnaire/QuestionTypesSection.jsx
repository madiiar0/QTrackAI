import styles from '../Quiz.module.css';

const QuestionTypesSection = () => {
  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Question types</h2>
        <p>Set the mix of question formats for the exam.</p>
      </div>
    </div>
  );
};

export default QuestionTypesSection;
