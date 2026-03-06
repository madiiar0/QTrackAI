import { useCallback, useEffect, useState } from 'react';
import promptApi from '../../api/prompt';
import styles from '../Quiz.module.css';

const OutputFormatSection = ({ registerNextHandler, registerSectionActions }) => {
  const [examSnapshot, setExamSnapshot] = useState({});
  const [outputFormat, setOutputFormat] = useState('');
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [spaceForWork, setSpaceForWork] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadPrompt = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const { data } = await promptApi.get('/');
      const exam = data?.prompt?.exam || {};
      const normalizedOutputFormat =
        String(exam?.outputFormat || '').toLowerCase() === 'latex' ? 'latex' : 'pdf';

      setExamSnapshot(exam);
      setOutputFormat(normalizedOutputFormat);
      setIncludeSolutions(
        typeof exam?.includeFullSolution === 'boolean' ? exam.includeFullSolution : true
      );
      setSpaceForWork(
        typeof exam?.includeSpaceForWork === 'boolean' ? exam.includeSpaceForWork : false
      );
    } catch (error) {
      console.error('Failed to load output format settings', error);
      setLoadError('Unable to load output settings. Please try again.');
      setOutputFormat('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  const handleSaveAndFinish = useCallback(async () => {
    if (isLoading) return { ok: false, error: 'Please wait until the section is fully loaded.' };
    if (loadError) return { ok: false, error: loadError };
    if (!outputFormat) return { ok: false, error: 'Please select an output format (PDF or LaTeX).' };

    try {
      await promptApi.post('/', {
        status: 'Completed',
        exam: {
          ...examSnapshot,
          outputFormat,
          includeFullSolution: includeSolutions,
          includeSpaceForWork: spaceForWork,
        },
      });
      return { ok: true };
    } catch (error) {
      console.error('Failed to save output settings', error);
      return { ok: false, error: 'Unable to save output settings. Please try again.' };
    }
  }, [examSnapshot, includeSolutions, isLoading, loadError, outputFormat, spaceForWork]);

  useEffect(() => {
    if (!registerNextHandler) return undefined;
    registerNextHandler(handleSaveAndFinish);
    return () => registerNextHandler(null);
  }, [handleSaveAndFinish, registerNextHandler]);

  useEffect(() => {
    if (!registerSectionActions) return undefined;
    registerSectionActions(null);
    return undefined;
  }, [registerSectionActions]);

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Output Format</h2>
        <p>Choose how the exam should be generated and delivered.</p>
      </div>

      {isLoading ? <p className={styles.topicDistributionInfo}>Loading output settings…</p> : null}
      {loadError ? <p className={styles.modalError}>{loadError}</p> : null}

      {!isLoading && !loadError ? (
        <div className={styles.outputSettingsStack}>
          <div className={styles.outputSettingCard}>
            <h3>Output format</h3>
            <p>Choose the file format for your generated exam.</p>
            <div className={styles.choiceGroup}>
              <button
                type="button"
                className={`${styles.choiceButton} ${outputFormat === 'pdf' ? styles.choiceButtonActive : ''}`}
                onClick={() => setOutputFormat('pdf')}
              >
                PDF
              </button>
              <button
                type="button"
                className={`${styles.choiceButton} ${outputFormat === 'latex' ? styles.choiceButtonActive : ''}`}
                onClick={() => setOutputFormat('latex')}
              >
                LaTeX
              </button>
            </div>
          </div>

          <div className={styles.outputSettingCard}>
            <h3>Include solutions</h3>
            <p>Decide whether full worked solutions should be included.</p>
            <div className={styles.choiceGroup}>
              <button
                type="button"
                className={`${styles.choiceButton} ${includeSolutions ? styles.choiceButtonActive : ''}`}
                onClick={() => setIncludeSolutions(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`${styles.choiceButton} ${!includeSolutions ? styles.choiceButtonActive : ''}`}
                onClick={() => setIncludeSolutions(false)}
              >
                No
              </button>
            </div>
          </div>

          <div className={styles.outputSettingCard}>
            <h3>Space for work</h3>
            <p>Include blank space under each question for student work.</p>
            <div className={styles.choiceGroup}>
              <button
                type="button"
                className={`${styles.choiceButton} ${spaceForWork ? styles.choiceButtonActive : ''}`}
                onClick={() => setSpaceForWork(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`${styles.choiceButton} ${!spaceForWork ? styles.choiceButtonActive : ''}`}
                onClick={() => setSpaceForWork(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OutputFormatSection;
