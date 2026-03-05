import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import promptApi from '../../api/prompt';
import filesApi from '../../api/files';
import styles from '../Quiz.module.css';

const TopicsSection = ({ topics = [], onTopicsUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slidesFile, setSlidesFile] = useState(null);
  const [worksheetFile, setWorksheetFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTopicIds, setDeletingTopicIds] = useState({});
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const topicList = useMemo(() => topics || [], [topics]);

  const resetModal = () => {
    setTitle('');
    setDescription('');
    setSlidesFile(null);
    setWorksheetFile(null);
    setError('');
  };

  const closeModal = () => {
    setIsOpen(false);
    resetModal();
  };

  const uploadIfSelected = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append('file', file);
    const response = await filesApi.post('/', data);
    return response?.data?.fileId || null;
  };

  const buildTopicId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `t_${crypto.randomUUID()}`;
    }
    return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };

  const handleConfirm = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const [slidesId, worksheetId] = await Promise.all([
        uploadIfSelected(slidesFile),
        uploadIfSelected(worksheetFile),
      ]);

      const fileIds = [slidesId, worksheetId].filter(Boolean);
      const newTopic = {
        topicId: buildTopicId(),
        title: title.trim(),
        description: description.trim(),
        materials: fileIds,
      };

      const updatedTopics = [...topicList, newTopic];
      await promptApi.post('/', {
        status: 'Section_2',
        topics: updatedTopics,
      });

      if (onTopicsUpdate) onTopicsUpdate(updatedTopics);
      closeModal();
    } catch (err) {
      console.error('Failed to add topic', err);
      setError('Unable to add topic. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!topicId) return;

    setDeleteError('');
    setDeletingTopicIds((prev) => ({ ...prev, [topicId]: true }));

    try {
      const updatedTopics = topicList.filter((topic) => topic.topicId !== topicId);
      await promptApi.post('/', {
        status: 'Section_2',
        topics: updatedTopics,
      });

      if (onTopicsUpdate) onTopicsUpdate(updatedTopics);
    } catch (err) {
      console.error('Failed to delete topic', err);
      setDeleteError('Unable to delete topic. Please try again.');
    } finally {
      setDeletingTopicIds((prev) => {
        const next = { ...prev };
        delete next[topicId];
        return next;
      });
    }
  };

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Topics</h2>
        <p>Define the topics that the exam should cover.</p>
      </div>

      <button
        type="button"
        className={styles.addTopicButton}
        onClick={() => setIsOpen(true)}
      >
        + Add Topic
      </button>

      <div className={styles.topicsStack}>
        {topicList.length === 0 ? (
          <div className={styles.topicEmpty}>
            No topics added yet. Start by adding your first topic.
          </div>
        ) : (
          topicList.map((topic) => (
            <div key={topic.topicId} className={styles.topicCard}>
              <div className={styles.topicMeta}>
                <h3>{topic.title || 'Untitled topic'}</h3>
                {topic.description ? <p>{topic.description}</p> : null}
              </div>
              <div className={styles.topicActions}>
                {(Array.isArray(topic?.materials)
                  ? topic.materials.length
                  : topic?.materials?.fileIds?.length) ? (
                  <span className={styles.topicBadge}>
                    {Array.isArray(topic?.materials)
                      ? topic.materials.length
                      : topic.materials.fileIds.length}{' '}
                    file
                    {(Array.isArray(topic?.materials)
                      ? topic.materials.length
                      : topic.materials.fileIds.length) > 1
                      ? 's'
                      : ''}
                  </span>
                ) : (
                  <span className={styles.topicBadgeMuted}>No files</span>
                )}
                <button
                  type="button"
                  className={styles.topicDeleteButton}
                  onClick={() => handleDeleteTopic(topic.topicId)}
                  disabled={Boolean(deletingTopicIds[topic.topicId])}
                  aria-label={`Delete ${topic.title || 'topic'}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {deleteError ? <p className={styles.modalError}>{deleteError}</p> : null}

      {isOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>Add Topic</h3>
              <p>Provide topic details and attach optional materials.</p>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.field}>
                Title
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Quadratic equations"
                />
              </label>
              <label className={styles.field}>
                Description
                <textarea
                  className={styles.textarea}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional details about the topic"
                  rows={4}
                />
              </label>
              <label className={styles.field}>
                Upload Slides file
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(event) => setSlidesFile(event.target.files?.[0] || null)}
                />
              </label>
              <label className={styles.field}>
                Upload Worksheet file
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(event) => setWorksheetFile(event.target.files?.[0] || null)}
                />
              </label>
              {error ? <p className={styles.modalError}>{error}</p> : null}
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={handleConfirm}
                disabled={isSaving}
              >
                {isSaving ? 'Adding…' : 'Add Topic'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TopicsSection;
