import { useCallback, useEffect, useMemo, useState } from 'react';
import promptApi from '../../api/prompt';
import styles from '../Quiz.module.css';

const QUESTION_TYPES = [
  'Multiple choice',
  'Short answer',
  'Numeric answer',
  'Proof/Derivation',
  'Matching',
  'True/False',
];

const QuestionTypesSection = ({ topics = [], registerNextHandler, registerSectionActions, isSaving = false }) => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isRandomizeOpen, setIsRandomizeOpen] = useState(false);
  const [isBrushOpen, setIsBrushOpen] = useState(false);
  const [bulkType, setBulkType] = useState(QUESTION_TYPES[0]);
  const [randomizeError, setRandomizeError] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(
    Object.fromEntries(QUESTION_TYPES.map((type) => [type, true]))
  );

  const loadPrompt = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const { data } = await promptApi.get('/');
      const prompt = data?.prompt || {};
      const promptTopics = Array.isArray(prompt?.topics) ? prompt.topics : [];
      const promptQuestions = Array.isArray(prompt?.questions) ? prompt.questions : [];
      const topicTitleById = new Map(
        promptTopics.map((topic) => [topic.topicId, topic.title || 'Untitled topic'])
      );

      const normalizedRows = promptQuestions.map((question, index) => ({
        ...question,
        questionId: question?.questionId || `Q${index + 1}`,
        difficulty: String(question?.difficulty || '').toLowerCase(),
        questionType: question?.questionType || '',
        topicTitle: topicTitleById.get(question?.topicId) || 'Unknown topic',
      }));

      setRows(normalizedRows);
    } catch (error) {
      console.error('Failed to load questions for question types section', error);
      setLoadError('Unable to load questions. Please try again.');
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt, topics]);

  const handleTypeChange = (questionId, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.questionId === questionId
          ? {
              ...row,
              questionType: value,
            }
          : row
      )
    );
  };

  const openRandomizeModal = useCallback(() => {
    setSelectedTypes(Object.fromEntries(QUESTION_TYPES.map((type) => [type, true])));
    setRandomizeError('');
    setIsRandomizeOpen(true);
  }, []);

  const handleConfirmRandomize = () => {
    const pool = QUESTION_TYPES.filter((type) => selectedTypes[type]);
    if (pool.length === 0) {
      setRandomizeError('Select at least one question type.');
      return;
    }

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        questionType: pool[Math.floor(Math.random() * pool.length)],
      }))
    );
    setIsRandomizeOpen(false);
  };

  const openBrushModal = useCallback(() => {
    setBulkType(QUESTION_TYPES[0]);
    setIsBrushOpen(true);
  }, []);

  const handleApplyBulkType = () => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        questionType: bulkType,
      }))
    );
    setIsBrushOpen(false);
  };

  const handleSaveAndContinue = useCallback(async () => {
    if (isLoading) return { ok: false, error: 'Please wait until the section is fully loaded.' };
    if (loadError) return { ok: false, error: loadError };
    if (rows.length === 0) return { ok: false, error: 'No questions found. Complete section 3 first.' };

    const missing = rows
      .filter((question) => !String(question?.questionType || '').trim())
      .map((question) => question.questionId);

    if (missing.length > 0) {
      return {
        ok: false,
        error: `Please select a question type for all questions. Missing: ${missing.join(', ')}`,
      };
    }

    try {
      const payload = rows.map(({ topicTitle, ...question }) => ({
        ...question,
        questionType: question.questionType,
      }));
      await promptApi.post('/', { questions: payload });
      return { ok: true };
    } catch (error) {
      console.error('Failed to save question types', error);
      return { ok: false, error: 'Unable to save question types. Please try again.' };
    }
  }, [isLoading, loadError, rows]);

  useEffect(() => {
    if (!registerNextHandler) return undefined;
    registerNextHandler(handleSaveAndContinue);
    return () => registerNextHandler(null);
  }, [handleSaveAndContinue, registerNextHandler]);

  useEffect(() => {
    if (!registerSectionActions) return undefined;
    registerSectionActions({
      show: true,
      disable: isLoading || !!loadError || rows.length === 0 || isSaving,
      roundIcon: 'brush',
      roundAriaLabel: 'Set one type for all questions',
      onRoundAction: openBrushModal,
      secondaryLabel: 'Randomize',
      onSecondaryAction: openRandomizeModal,
    });
    return () => registerSectionActions(null);
  }, [
    isLoading,
    loadError,
    rows.length,
    isSaving,
    openBrushModal,
    openRandomizeModal,
    registerSectionActions,
  ]);

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Question types</h2>
        <p>Set the mix of question formats for the exam.</p>
      </div>

      {isLoading ? <p className={styles.topicDistributionInfo}>Loading questions…</p> : null}
      {loadError ? <p className={styles.modalError}>{loadError}</p> : null}

      {!isLoading && !loadError ? (
        rows.length === 0 ? (
          <p className={styles.topicDistributionInfo}>
            No questions found. Finish section 3 to generate questions first.
          </p>
        ) : (
          <div className={styles.topicDistributionTableWrap}>
            <table className={styles.topicDistributionTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.questionId}>
                    <td className={styles.readOnlyCell}>{index + 1}</td>
                    <td className={styles.readOnlyCell}>{row.topicTitle}</td>
                    <td className={styles.readOnlyCell}>{row.difficulty || '-'}</td>
                    <td>
                      <select
                        className={styles.questionTypeSelect}
                        value={row.questionType}
                        onChange={(event) => handleTypeChange(row.questionId, event.target.value)}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        {QUESTION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {isRandomizeOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>Randomize Question Types</h3>
              <p>Uncheck any types you want to exclude from randomization.</p>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.checkboxList}>
                {QUESTION_TYPES.map((type) => (
                  <label key={type} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={Boolean(selectedTypes[type])}
                      onChange={(event) =>
                        setSelectedTypes((prev) => ({
                          ...prev,
                          [type]: event.target.checked,
                        }))
                      }
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              {randomizeError ? <p className={styles.modalError}>{randomizeError}</p> : null}
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => {
                  setIsRandomizeOpen(false);
                  setRandomizeError('');
                }}
              >
                Cancel
              </button>
              <button type="button" className={styles.modalConfirm} onClick={handleConfirmRandomize}>
                Randomize
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isBrushOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>Set One Type for All Questions</h3>
              <p>Select one type and apply it to every question.</p>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.field}>
                Question type
                <select value={bulkType} onChange={(event) => setBulkType(event.target.value)}>
                  {QUESTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setIsBrushOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className={styles.modalConfirm} onClick={handleApplyBulkType}>
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuestionTypesSection;
