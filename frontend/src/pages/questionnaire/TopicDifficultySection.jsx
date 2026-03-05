import { useCallback, useEffect, useMemo, useState } from 'react';
import promptApi from '../../api/prompt';
import styles from '../Quiz.module.css';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const toSafeInteger = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 0;
  return Math.max(0, parsed);
};

const buildEvenDistribution = (topics, totalQuestions) => {
  const safeTotal = Math.max(0, toSafeInteger(totalQuestions));
  if (!Array.isArray(topics) || topics.length === 0) return [];

  const topicCount = topics.length;
  const basePerTopic = Math.floor(safeTotal / topicCount);
  const topicRemainder = safeTotal % topicCount;

  return topics.map((topic, topicIndex) => {
    const targetForTopic = basePerTopic + (topicIndex < topicRemainder ? 1 : 0);
    const basePerDifficulty = Math.floor(targetForTopic / DIFFICULTIES.length);
    const remainderForDifficulty = targetForTopic % DIFFICULTIES.length;
    const rotationStart = topicIndex % DIFFICULTIES.length;

    const counts = { easy: basePerDifficulty, medium: basePerDifficulty, hard: basePerDifficulty };

    for (let idx = 0; idx < remainderForDifficulty; idx += 1) {
      const key = DIFFICULTIES[(rotationStart + idx) % DIFFICULTIES.length];
      counts[key] += 1;
    }

    return {
      topicId: topic.topicId,
      title: topic.title || 'Untitled topic',
      easy: counts.easy,
      medium: counts.medium,
      hard: counts.hard,
    };
  });
};

const buildDistributionFromQuestions = (topics, questions, totalQuestions) => {
  if (!Array.isArray(topics) || topics.length === 0) return [];
  if (!Array.isArray(questions) || questions.length === 0) return null;

  const safeTotal = Math.max(0, toSafeInteger(totalQuestions));
  if (questions.length !== safeTotal) return null;

  const byTopic = new Map();
  topics.forEach((topic) => {
    byTopic.set(topic.topicId, {
      topicId: topic.topicId,
      title: topic.title || 'Untitled topic',
      easy: 0,
      medium: 0,
      hard: 0,
    });
  });

  for (const question of questions) {
    const row = byTopic.get(question?.topicId);
    const difficulty = String(question?.difficulty || '').toLowerCase();
    if (!row) return null;
    if (!DIFFICULTIES.includes(difficulty)) return null;
    row[difficulty] += 1;
  }

  return topics.map((topic) => byTopic.get(topic.topicId));
};

const buildSkeletonQuestions = (rows) => {
  let sequence = 1;
  const questions = [];

  rows.forEach((row) => {
    DIFFICULTIES.forEach((difficulty) => {
      const count = toSafeInteger(row[difficulty]);
      for (let idx = 0; idx < count; idx += 1) {
        questions.push({
          questionId: `Q${sequence}`,
          topicId: row.topicId,
          difficulty,
        });
        sequence += 1;
      }
    });
  });

  return questions;
};

const buildRandomDistribution = (topics, totalQuestions) => {
  const safeTotal = Math.max(0, toSafeInteger(totalQuestions));
  if (!Array.isArray(topics) || topics.length === 0) return [];

  const cells = topics.length * DIFFICULTIES.length;
  const buckets = Array.from({ length: cells }, () => 0);

  for (let idx = 0; idx < safeTotal; idx += 1) {
    const randomCell = Math.floor(Math.random() * cells);
    buckets[randomCell] += 1;
  }

  return topics.map((topic, topicIndex) => {
    const offset = topicIndex * DIFFICULTIES.length;
    return {
      topicId: topic.topicId,
      title: topic.title || 'Untitled topic',
      easy: buckets[offset],
      medium: buckets[offset + 1],
      hard: buckets[offset + 2],
    };
  });
};

const TopicDifficultySection = ({
  topics = [],
  registerNextHandler,
  registerSectionActions,
  isSaving = false,
}) => {
  const [rows, setRows] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [topicMeta, setTopicMeta] = useState([]);

  const loadPrompt = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const { data } = await promptApi.get('/');
      const prompt = data?.prompt || {};
      const promptTopics = Array.isArray(prompt.topics) ? prompt.topics : [];
      const promptQuestions = Array.isArray(prompt.questions) ? prompt.questions : [];
      const nextTotal = Math.max(0, toSafeInteger(prompt?.exam?.totalQuestions));

      const restoredRows = buildDistributionFromQuestions(
        promptTopics,
        promptQuestions,
        nextTotal
      );
      const initialRows =
        restoredRows === null
          ? buildEvenDistribution(promptTopics, nextTotal)
          : restoredRows;

      const nextTopicMeta = promptTopics.map((topic) => ({
        topicId: topic.topicId,
        title: topic.title || 'Untitled topic',
      }));

      setTotalQuestions(nextTotal);
      setRows(initialRows);
      setTopicMeta(nextTopicMeta);
    } catch (error) {
      console.error('Failed to load prompt for topic distribution', error);
      setLoadError('Unable to load topics and total questions. Please try again.');
      setRows([]);
      setTotalQuestions(0);
      setTopicMeta([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt, topics]);

  const rowsWithTotals = useMemo(
    () =>
      rows.map((row) => {
        const rowTotal = toSafeInteger(row.easy) + toSafeInteger(row.medium) + toSafeInteger(row.hard);
        const weight = totalQuestions > 0 ? Math.round((rowTotal / totalQuestions) * 100) : 0;
        return {
          ...row,
          rowTotal,
          weight,
        };
      }),
    [rows, totalQuestions]
  );

  const columnTotals = useMemo(() => {
    const easyTotal = rowsWithTotals.reduce((sum, row) => sum + toSafeInteger(row.easy), 0);
    const mediumTotal = rowsWithTotals.reduce((sum, row) => sum + toSafeInteger(row.medium), 0);
    const hardTotal = rowsWithTotals.reduce((sum, row) => sum + toSafeInteger(row.hard), 0);
    const grandTotal = easyTotal + mediumTotal + hardTotal;
    return { easyTotal, mediumTotal, hardTotal, grandTotal };
  }, [rowsWithTotals]);

  const handleInputChange = (topicId, difficulty, event) => {
    const rawValue = event.target.value;
    if (rawValue === '') {
      setRows((prev) =>
        prev.map((row) =>
          row.topicId === topicId
            ? {
                ...row,
                [difficulty]: '',
              }
            : row
        )
      );
      return;
    }

    const parsed = Number.parseInt(rawValue, 10);
    if (Number.isNaN(parsed)) return;

    const value = Math.max(0, parsed);
    setRows((prev) =>
      prev.map((row) =>
        row.topicId === topicId
          ? {
              ...row,
              [difficulty]: value,
            }
          : row
      )
    );
  };

  const handleSaveAndContinue = useCallback(async () => {
    if (isLoading) {
      return { ok: false, error: 'Please wait until the section is fully loaded.' };
    }
    if (loadError) {
      return { ok: false, error: loadError };
    }
    if (rowsWithTotals.length === 0) {
      return { ok: false, error: 'Please add at least one topic before continuing.' };
    }

    if (columnTotals.grandTotal !== totalQuestions) {
      return {
        ok: false,
        error: `Total questions must equal ${totalQuestions}. Currently ${columnTotals.grandTotal}.`,
      };
    }

    const questions = buildSkeletonQuestions(rowsWithTotals);

    try {
      await promptApi.post('/', {
        status: 'Section_3',
        questions,
      });
      return { ok: true };
    } catch (error) {
      console.error('Failed to save topic and difficulty distribution', error);
      return { ok: false, error: 'Unable to save topic distribution. Please try again.' };
    }
  }, [columnTotals.grandTotal, isLoading, loadError, rowsWithTotals, totalQuestions]);

  useEffect(() => {
    if (!registerNextHandler) return undefined;
    registerNextHandler(handleSaveAndContinue);
    return () => registerNextHandler(null);
  }, [handleSaveAndContinue, registerNextHandler]);

  const handleResetToEven = useCallback(() => {
    setRows(buildEvenDistribution(topicMeta, totalQuestions));
  }, [topicMeta, totalQuestions]);

  const handleRandomize = useCallback(() => {
    setRows(buildRandomDistribution(topicMeta, totalQuestions));
  }, [topicMeta, totalQuestions]);

  useEffect(() => {
    if (!registerSectionActions) return undefined;
    registerSectionActions({
      show: true,
      disable: isLoading || !!loadError || rowsWithTotals.length === 0 || isSaving,
      onReset: handleResetToEven,
      onRandomize: handleRandomize,
    });
    return () => registerSectionActions(null);
  }, [
    handleRandomize,
    handleResetToEven,
    isLoading,
    isSaving,
    loadError,
    registerSectionActions,
    rowsWithTotals.length,
  ]);

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Topic and difficulty distribution</h2>
        <p>Allocate how many questions should appear by topic and difficulty.</p>
      </div>
      {isLoading ? <p className={styles.topicDistributionInfo}>Loading topics and exam setup…</p> : null}
      {loadError ? <p className={styles.modalError}>{loadError}</p> : null}

      {!isLoading && !loadError ? (
        rowsWithTotals.length === 0 ? (
          <p className={styles.topicDistributionInfo}>
            Add topics in section 2 and set total questions in section 1 to continue.
          </p>
        ) : (
          <div className={styles.topicDistributionTableWrap}>
            <table className={styles.topicDistributionTable}>
              <thead>
                <tr>
                  <th>Topics</th>
                  <th>Easy</th>
                  <th>Medium</th>
                  <th>Hard</th>
                  <th className={styles.emphasisHeader}>Total</th>
                  <th className={styles.emphasisHeader}>Weight (%)</th>
                </tr>
              </thead>
              <tbody>
                {rowsWithTotals.map((row) => (
                  <tr key={row.topicId}>
                    <td className={styles.topicTitleCell}>{row.title}</td>
                    {DIFFICULTIES.map((difficulty) => (
                      <td key={`${row.topicId}-${difficulty}`}>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className={styles.topicCountInput}
                          value={row[difficulty]}
                          onChange={(event) => handleInputChange(row.topicId, difficulty, event)}
                        />
                      </td>
                    ))}
                    <td className={`${styles.readOnlyCell} ${styles.totalAccentCell}`}>{row.rowTotal}</td>
                    <td className={`${styles.readOnlyCell} ${styles.totalAccentCell}`}>{row.weight}</td>
                  </tr>
                ))}
                <tr className={styles.totalRow}>
                  <td>Total</td>
                  <td>{columnTotals.easyTotal}</td>
                  <td>{columnTotals.mediumTotal}</td>
                  <td>{columnTotals.hardTotal}</td>
                  <td>{columnTotals.grandTotal}</td>
                  <td>{totalQuestions > 0 ? 100 : 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
};

export default TopicDifficultySection;
