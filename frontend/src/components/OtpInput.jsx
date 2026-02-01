import { useRef } from 'react';
import styles from './OtpInput.module.css';

const OtpInput = ({ length = 6, value, onChange }) => {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, index) => value[index] || '');

  const updateValue = (nextDigits) => {
    onChange(nextDigits.join(''));
  };

  const handleChange = (index, event) => {
    const nextValue = event.target.value.replace(/\D/g, '');
    const nextDigits = [...digits];

    if (!nextValue) {
      nextDigits[index] = '';
      updateValue(nextDigits);
      return;
    }

    const split = nextValue.split('');
    split.forEach((digit, offset) => {
      const targetIndex = index + offset;
      if (targetIndex < length) {
        nextDigits[targetIndex] = digit;
      }
    });

    updateValue(nextDigits);

    const nextIndex = Math.min(index + split.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const nextDigits = Array.from({ length }, (_, index) => pasted[index] || '');
    updateValue(nextDigits);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className={styles.wrapper} onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className={styles.input}
        />
      ))}
    </div>
  );
};

export default OtpInput;
