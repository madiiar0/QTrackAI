import styles from '../Quiz.module.css';

const OverviewSection = ({ formData, onExamChange }) => {
  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Overview</h2>
        <p>Start with the essentials so the exam setup is clear.</p>
      </div>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          Exam title
          <input
            type="text"
            value={formData.exam.title}
            onChange={onExamChange('title')}
            placeholder="e.g. Intro to Algebra Diagnostic"
          />
        </label>
        <label className={styles.field}>
          Audience
          <select
            value={formData.exam.audienceLevel}
            onChange={onExamChange('audienceLevel')}
          >
            <option value="">Select audience</option>
            <option value="Early Elementary">Early Elementary</option>
            <option value="Middle School">Middle School</option>
            <option value="High School">High School</option>
            <option value="Foundation Year">Foundation Year</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Graduate">Graduate</option>
          </select>
        </label>
        <label className={styles.field}>
          Number of questions
          <input
            type="number"
            min="1"
            step="1"
            value={formData.exam.numQuestions}
            onChange={onExamChange('numQuestions')}
            placeholder="e.g. 20"
          />
        </label>
        <label className={styles.field}>
          Total score
          <input
            type="number"
            min="1"
            step="1"
            value={formData.exam.totalScore}
            onChange={onExamChange('totalScore')}
            placeholder="e.g. 100"
          />
        </label>
      </div>
    </div>
  );
};

export default OverviewSection;
