import { useCallback, useEffect, useMemo, useState } from 'react';
import promptApi from '../../api/prompt';
import styles from '../Quiz.module.css';

const toSafeInteger = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 0;
  return parsed;
};

const buildEvenPoints = (questionCount, totalScore) => {
  const safeCount = Math.max(0, toSafeInteger(questionCount));
  const safeTotal = Math.max(0, toSafeInteger(totalScore));
  if (safeCount === 0) return [];

  const base = Math.floor(safeTotal / safeCount);
  const remainder = safeTotal % safeCount;
  return Array.from({ length: safeCount }, (_, index) => base + (index < remainder ? 1 : 0));
};

const buildRandomPoints = (questionCount, totalScore) => {
  const safeCount = Math.max(0, toSafeInteger(questionCount));
  const safeTotal = Math.max(0, toSafeInteger(totalScore));
  if (safeCount === 0) return [];
  if (safeTotal < safeCount) return null;

  const points = Array.from({ length: safeCount }, () => 1);
  let remaining = safeTotal - safeCount;

  while (remaining > 0) {
    const randomIndex = Math.floor(Math.random() * safeCount);
    points[randomIndex] += 1;
    remaining -= 1;
  }

  return points;
};

const ScoreDistributionSection = ({ registerNextHandler, registerSectionActions, isSaving = false }) => {
  const [rows, setRows] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadPrompt = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    setActionError('');

    try {
      const { data } = await promptApi.get('/');
      const prompt = data?.prompt || {};
      const promptTopics = Array.isArray(prompt?.topics) ? prompt.topics : [];
      const promptQuestions = Array.isArray(prompt?.questions) ? prompt.questions : [];
      const nextTotalScore = Math.max(0, toSafeInteger(prompt?.exam?.totalScore));
      const topicMap = new Map(
        promptTopics.map((topic) => [topic.topicId, topic.title || 'Untitled topic'])
      );

      const normalizedRows = promptQuestions.map((question, index) => ({
        ...question,
        questionId: question?.questionId || `Q${index + 1}`,
        topicTitle: topicMap.get(question?.topicId) || 'Unknown topic',
        difficulty: String(question?.difficulty || '').toLowerCase(),
        questionType: question?.questionType || '',
        points:
          Number.isInteger(question?.points) && question.points >= 0
            ? question.points
            : '',
      }));

      const hasPointsForAll =
        normalizedRows.length > 0 &&
        normalizedRows.every((question) => Number.isInteger(question.points) && question.points >= 0);
      const evenPoints = buildEvenPoints(normalizedRows.length, nextTotalScore);

      const initializedRows = hasPointsForAll
        ? normalizedRows
        : normalizedRows.map((question, index) => ({
            ...question,
            points: evenPoints[index] ?? 0,
          }));

      setTotalScore(nextTotalScore);
      setRows(initializedRows);
    } catch (error) {
      console.error('Failed to load questions for score distribution', error);
      setLoadError('Unable to load score distribution data. Please try again.');
      setRows([]);
      setTotalScore(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  const totalPoints = useMemo(
    () => rows.reduce((sum, row) => sum + Math.max(0, toSafeInteger(row.points)), 0),
    [rows]
  );

  const handlePointsChange = (questionId, event) => {
    const rawValue = event.target.value;
    if (rawValue === '') {
      setRows((prev) =>
        prev.map((row) =>
          row.questionId === questionId
            ? {
                ...row,
                points: '',
              }
            : row
        )
      );
      return;
    }

    const parsed = Number.parseInt(rawValue, 10);
    if (Number.isNaN(parsed)) return;

    setRows((prev) =>
      prev.map((row) =>
        row.questionId === questionId
          ? {
              ...row,
              points: Math.max(0, parsed),
            }
          : row
      )
    );
  };

  const handleResetToEven = useCallback(() => {
    setActionError('');
    const evenPoints = buildEvenPoints(rows.length, totalScore);
    setRows((prev) =>
      prev.map((row, index) => ({
        ...row,
        points: evenPoints[index] ?? 0,
      }))
    );
  }, [rows.length, totalScore]);

  const handleRandomize = useCallback(() => {
    const randomPoints = buildRandomPoints(rows.length, totalScore);
    if (!randomPoints) {
      setActionError(
        `Cannot randomize with minimum 1 point per question when total score is ${totalScore}.`
      );
      return;
    }

    setActionError('');
    setRows((prev) =>
      prev.map((row, index) => ({
        ...row,
        points: randomPoints[index] ?? 1,
      }))
    );
  }, [rows.length, totalScore]);

  const handleSaveAndContinue = useCallback(async () => {
    if (isLoading) return { ok: false, error: 'Please wait until the section is fully loaded.' };
    if (loadError) return { ok: false, error: loadError };
    if (rows.length === 0) return { ok: false, error: 'No questions found. Complete section 3 first.' };

    const invalidQuestions = rows
      .filter((question) => {
        const value = question.points;
        return !Number.isInteger(value) || value < 0;
      })
      .map((question) => question.questionId);

    if (invalidQuestions.length > 0) {
      return {
        ok: false,
        error: `Invalid points for: ${invalidQuestions.join(', ')}. Use whole numbers 0 or greater.`,
      };
    }

    if (totalPoints !== totalScore) {
      return {
        ok: false,
        error: `Total points must equal ${totalScore}. Currently ${totalPoints}.`,
      };
    }

    const payload = rows.map(({ topicTitle, ...question }) => ({
      ...question,
      points: toSafeInteger(question.points),
    }));

    try {
      await promptApi.post('/', { questions: payload });
      return { ok: true };
    } catch (error) {
      console.error('Failed to save score distribution', error);
      return { ok: false, error: 'Unable to save score distribution. Please try again.' };
    }
  }, [isLoading, loadError, rows, totalPoints, totalScore]);

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
      roundIcon: 'rotate',
      roundAriaLabel: 'Reset to even distribution',
      onRoundAction: handleResetToEven,
      secondaryLabel: 'Randomize',
      onSecondaryAction: handleRandomize,
    });
    return () => registerSectionActions(null);
  }, [
    handleRandomize,
    handleResetToEven,
    isLoading,
    isSaving,
    loadError,
    registerSectionActions,
    rows.length,
  ]);

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Score distribution</h2>
        <p>Describe how points should be distributed across questions.</p>
      </div>

      {isLoading ? <p className={styles.topicDistributionInfo}>Loading score distribution…</p> : null}
      {loadError ? <p className={styles.modalError}>{loadError}</p> : null}
      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

      {!isLoading && !loadError ? (
        rows.length === 0 ? (
          <p className={styles.topicDistributionInfo}>
            No questions found. Complete section 3 to generate questions first.
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
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.questionId}>
                    <td className={styles.readOnlyCell}>{row.questionId || index + 1}</td>
                    <td className={styles.readOnlyCell}>{row.topicTitle}</td>
                    <td className={styles.readOnlyCell}>{row.difficulty || '-'}</td>
                    <td className={styles.readOnlyCell}>{row.questionType || '-'}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={styles.topicCountInput}
                        value={row.points}
                        onChange={(event) => handlePointsChange(row.questionId, event)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {!isLoading && rows.length > 0 ? (
        <p className={styles.pointsSummary}>
          Total points: {totalPoints} / {totalScore}
        </p>
      ) : null}
    </div>
  );
};

export default ScoreDistributionSection;
