import { useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import OverviewSection from './questionnaire/OverviewSection';
import TopicsSection from './questionnaire/TopicsSection';
import TopicDifficultySection from './questionnaire/TopicDifficultySection';
import QuestionTypesSection from './questionnaire/QuestionTypesSection';
import ScoreDistributionSection from './questionnaire/ScoreDistributionSection';
import OutputFormatSection from './questionnaire/OutputFormatSection';
import styles from './Quiz.module.css';

const Quiz = () => {
  const sections = useMemo(
    () => [
      { id: 'overview', label: 'Overview', component: OverviewSection },
      { id: 'topics', label: 'Topics', component: TopicsSection },
      {
        id: 'topic-difficulty',
        label: 'Topic distribution',
        component: TopicDifficultySection,
      },
      { id: 'question-types', label: 'Question types', component: QuestionTypesSection },
      { id: 'score-distribution', label: 'Score distribution', component: ScoreDistributionSection },
      { id: 'output-format', label: 'Output Format', component: OutputFormatSection },
    ],
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unlockedMax, setUnlockedMax] = useState(0);
  const [formData, setFormData] = useState({
    exam: {
      title: '',
      audienceLevel: '',
      numQuestions: '',
      totalScore: '',
    },
  });
  const isLast = currentIndex === sections.length - 1;
  const isOverview = currentIndex === 0;
  const ActiveSection = sections[currentIndex]?.component ?? null;

  const updateExam = (field) => (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        [field]: value,
      },
    }));
  };

  const isPositiveNumber = (value) => {
    if (value === '' || value === null || value === undefined) return false;
    const asNumber = Number(value);
    return Number.isFinite(asNumber) && asNumber > 0;
  };

  const overviewComplete =
    formData.exam.title.trim().length > 0 &&
    formData.exam.audienceLevel.trim().length > 0 &&
    isPositiveNumber(formData.exam.numQuestions) &&
    isPositiveNumber(formData.exam.totalScore);

  const canAdvance = isOverview ? overviewComplete : true;

  const handleNext = () => {
    if (isLast) return;
    if (!canAdvance) return;
    setUnlockedMax((prev) => Math.max(prev, currentIndex + 1));
    setCurrentIndex((prev) => Math.min(prev + 1, sections.length - 1));
  };

  const handleNav = (index) => {
    if (index <= unlockedMax) {
      setCurrentIndex(index);
    }
  };

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.main}>
        <section className={styles.shell}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <p>Fill out all the information for generating a high quality exam!</p>
            </div>
            <nav className={styles.panelNav} aria-label="Questionnaire sections">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  className={`${styles.panelItem} ${
                    index === currentIndex ? styles.panelItemActive : ''
                  }`}
                  onClick={() => handleNav(index)}
                  disabled={index > unlockedMax}
                  aria-current={index === currentIndex ? 'step' : undefined}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          <div className={styles.sectionStack}>
            <section className={styles.sectionBlock} aria-live="polite">
              <div className={styles.sectionBody}>
                {ActiveSection ? (
                  <ActiveSection
                    formData={formData}
                    onExamChange={updateExam}
                  />
                ) : null}
              </div>
              <div className={styles.sectionFooter}>
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={handleNext}
                  disabled={!canAdvance}
                >
                  {isLast ? 'Generate an Exam' : 'Next section'}
                </button>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Quiz;
