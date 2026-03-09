import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import Button from '../components/Button';
import generateApi from '../api/generate';
import filesApi from '../api/files';
import styles from './Collection.module.css';

const TERMINAL_STATUSES = new Set(['completed', 'failed']);

const Collection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [jobId, setJobId] = useState('');
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingFile, setIsFetchingFile] = useState(false);
  const [error, setError] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('generated_exam.pdf');
  const pollingRef = useRef(null);

  useEffect(() => {
    const fromState = location?.state?.jobId;
    const fromStorage = window.sessionStorage.getItem('latestGenerationJobId');
    const resolved = String(fromState || fromStorage || '');
    setJobId(resolved);
    if (!resolved) {
      setError('No generation job found. Start generation from the questionnaire first.');
      setIsLoading(false);
    }
  }, [location?.state?.jobId]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const fetchGeneratedFile = async (resultFileId) => {
    if (!resultFileId || fileUrl) return;
    setIsFetchingFile(true);

    try {
      const response = await filesApi.get(`/${resultFileId}`, { responseType: 'blob' });
      const blob = response?.data;
      const nextUrl = URL.createObjectURL(blob);
      setFileUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextUrl;
      });
      setFileName(`generated_exam_${resultFileId}.pdf`);
    } catch (fetchError) {
      console.error('Failed to fetch generated file', fetchError);
      setError('Generation completed, but failed to fetch the file.');
    } finally {
      setIsFetchingFile(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    const loadStatus = async () => {
      try {
        const { data } = await generateApi.get(`/status/${jobId}`);
        const nextJob = data?.job || null;
        if (cancelled || !nextJob) return;

        setJob(nextJob);
        setError('');

        const status = String(nextJob?.status || '').toLowerCase();
        const resultFileId = nextJob?.resultFileId || '';
        if (status === 'completed' && resultFileId) {
          await fetchGeneratedFile(resultFileId);
        }

        if (TERMINAL_STATUSES.has(status) && pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } catch (statusError) {
        if (cancelled) return;
        console.error('Failed to fetch generation status', statusError);
        setError('Failed to load generation status. Please refresh and try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadStatus();
    pollingRef.current = setInterval(loadStatus, 2500);

    return () => {
      cancelled = true;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = useMemo(() => {
    const raw = Number(job?.progress ?? 0);
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.min(100, raw));
  }, [job?.progress]);

  const isCompleted = String(job?.status || '').toLowerCase() === 'completed';
  const isFailed = String(job?.status || '').toLowerCase() === 'failed';

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h2>Collection</h2>
            <p>Track your exam generation progress and open the result when ready.</p>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          {isLoading ? (
            <p className={styles.info}>Loading generation status…</p>
          ) : (
            <>
              <div className={styles.statusRow}>
                <span className={styles.label}>Status</span>
                <span className={styles.value}>{job?.status || 'queued'}</span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.label}>Current step</span>
                <span className={styles.value}>{job?.currentStep || 'queued'}</span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.label}>Progress</span>
                <span className={styles.value}>{progress}%</span>
              </div>

              <div className={styles.progressWrap} aria-label="Generation progress">
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>

              {job?.error ? (
                <div className={styles.failureBox}>
                  <strong>Generation error:</strong> {job.error}
                </div>
              ) : null}

              <div className={styles.actions}>
                {isCompleted && fileUrl ? (
                  <Button
                    onClick={() => window.open(fileUrl, '_blank', 'noopener,noreferrer')}
                  >
                    Open File
                  </Button>
                ) : null}
                {isCompleted && !fileUrl ? (
                  <Button isLoading disabled={isFetchingFile}>
                    Preparing File
                  </Button>
                ) : null}
                {!isCompleted && !isFailed ? (
                  <Button variant="secondary" isLoading disabled>
                    Generating…
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  onClick={() => navigate('/questionnaire')}
                >
                  Back to Questionnaire
                </Button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Collection;
