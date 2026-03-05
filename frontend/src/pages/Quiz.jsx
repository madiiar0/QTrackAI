import { useEffect, useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import OverviewSection from './questionnaire/OverviewSection';
import TopicsSection from './questionnaire/TopicsSection';
import TopicDifficultySection from './questionnaire/TopicDifficultySection';
import QuestionTypesSection from './questionnaire/QuestionTypesSection';
import ScoreDistributionSection from './questionnaire/ScoreDistributionSection';
import OutputFormatSection from './questionnaire/OutputFormatSection';
import promptApi from '../api/prompt';
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState({
    exam: {
      title: '',
      audienceLevel: '',
      numQuestions: '',
      totalScore: '',
      outputFormat: 'pdf',
      includeFullSolution: true,
    },
    topics: [],
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

  const statusToIndex = (status) => {
    switch (status) {
      case 'Section_2':
        return 1;
      case 'Section_3':
        return 2;
      case 'Section_4':
        return 3;
      case 'Section_5':
        return 4;
      case 'Completed':
        return sections.length - 1;
      case 'Section_1':
      case 'Not_started':
      default:
        return 0;
    }
  };

  const indexToStatus = (index) => {
    if (index <= 0) return 'Section_1';
    if (index === 1) return 'Section_2';
    if (index === 2) return 'Section_3';
    if (index === 3) return 'Section_4';
    if (index === 4) return 'Section_5';
    return 'Completed';
  };

  useEffect(() => {
    let isActive = true;

    const hydratePrompt = async () => {
      try {
        const { data } = await promptApi.get('/');
        const exam = data?.prompt?.exam || {};
        const topics = data?.prompt?.topics || [];
        const status = data?.prompt?.status || 'Not_started';

        if (!isActive) return;
        setFormData((prev) => ({
          ...prev,
          exam: {
            ...prev.exam,
            title: exam.title ?? '',
            audienceLevel: exam.audience ?? '',
            numQuestions: exam.totalQuestions ?? '',
            totalScore: exam.totalScore ?? '',
            outputFormat: exam.outputFormat ?? prev.exam.outputFormat,
            includeFullSolution:
              typeof exam.includeFullSolution === 'boolean'
                ? exam.includeFullSolution
                : prev.exam.includeFullSolution,
          },
          topics,
        }));

        const hasOverviewData =
          (exam.title && String(exam.title).trim()) ||
          exam.audience ||
          Number.isFinite(Number(exam.totalQuestions)) ||
          Number.isFinite(Number(exam.totalScore));
        const hasTopicsData = Array.isArray(topics) && topics.length > 0;

        let restoredIndex = statusToIndex(status);
        if (status === 'Not_started') {
          restoredIndex = hasTopicsData ? 1 : hasOverviewData ? 0 : 0;
        }
        setCurrentIndex(restoredIndex);
        setUnlockedMax(restoredIndex);
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.error('Failed to load prompt', error);
        }
      }
    };

    hydratePrompt();

    return () => {
      isActive = false;
    };
  }, []);

  const saveOverview = async () => {
    const payload = {
      status: 'Section_1',
      exam: {
        title: formData.exam.title,
        audience: formData.exam.audienceLevel,
        totalQuestions:
          formData.exam.numQuestions === '' ? null : Number(formData.exam.numQuestions),
        totalScore:
          formData.exam.totalScore === '' ? null : Number(formData.exam.totalScore),
        outputFormat: formData.exam.outputFormat,
        includeFullSolution: formData.exam.includeFullSolution,
      },
    };

    setIsSaving(true);
    setSaveError('');

    try {
      await promptApi.post('/', payload);
      return true;
    } catch (error) {
      setSaveError('Unable to save overview. Please try again.');
      console.error('Failed to save overview', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTopicsUpdate = (topics) => {
    setFormData((prev) => ({ ...prev, topics }));
  };

  const saveProgressStatus = async (index) => {
    try {
      await promptApi.post('/', { status: indexToStatus(index) });
    } catch (error) {
      console.error('Failed to persist progress status', error);
    }
  };

  const handleNext = async () => {
    if (isLast) return;
    if (!canAdvance) return;

    if (isOverview) {
      const ok = await saveOverview();
      if (!ok) return;
    }

    const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
    setUnlockedMax((prev) => Math.max(prev, nextIndex));
    setCurrentIndex(nextIndex);
    await saveProgressStatus(nextIndex);
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
                    topics={formData.topics}
                    onTopicsUpdate={handleTopicsUpdate}
                  />
                ) : null}
              </div>
              <div className={styles.sectionFooter}>
                {saveError ? <p className={styles.saveError}>{saveError}</p> : null}
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={handleNext}
                  disabled={!canAdvance || isSaving}
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
