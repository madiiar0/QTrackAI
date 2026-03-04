import { motion, useReducedMotion } from 'framer-motion';
import styles from './AuthLayout.module.css';

const blobMotion = (delay = 0) => ({
  animate: {
    x: [0, 20, -10, 0],
    y: [0, -18, 12, 0],
    scale: [1, 1.05, 0.98, 1],
  },
  transition: {
    duration: 18,
    repeat: Infinity,
    ease: 'easeInOut',
    delay,
  },
});

const AuthLayout = ({ title, subtitle, children, footer, showLogo = true }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.page}>
      <div className={styles.background} aria-hidden="true">
        <div className={styles.gradient} />
        <motion.div
          className={`${styles.blob} ${styles.blobOne}`}
          {...(reduceMotion ? {} : blobMotion(0))}
        />
        <motion.div
          className={`${styles.blob} ${styles.blobTwo}`}
          {...(reduceMotion ? {} : blobMotion(2))}
        />
        <motion.div
          className={`${styles.blob} ${styles.blobThree}`}
          {...(reduceMotion ? {} : blobMotion(4))}
        />
      </div>

      <div className={styles.card}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{title}</h1>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
        </header>
        <div className={styles.content}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
};

export default AuthLayout;
