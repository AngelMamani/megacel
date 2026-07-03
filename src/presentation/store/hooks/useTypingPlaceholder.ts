import { useEffect, useState } from 'react';

const SEARCH_PHRASES = [
  'Buscar celulares...',
  'Buscar audífonos...',
  'Buscar cargadores...',
  'Buscar accesorios tech...',
];

export const useTypingPlaceholder = (IsActive: boolean) => {
  const [Placeholder, setPlaceholder] = useState(SEARCH_PHRASES[0]);

  useEffect(() => {
    if (!IsActive) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let IsDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const Tick = () => {
      const current = SEARCH_PHRASES[phraseIndex];

      if (!IsDeleting) {
        charIndex += 1;
        setPlaceholder(current.slice(0, charIndex));

        if (charIndex === current.length) {
          IsDeleting = true;
          timer = setTimeout(Tick, 1400);
          return;
        }

        timer = setTimeout(Tick, 55);
        return;
      }

      charIndex -= 1;
      setPlaceholder(current.slice(0, charIndex));

      if (charIndex === 0) {
        IsDeleting = false;
        phraseIndex = (phraseIndex + 1) % SEARCH_PHRASES.length;
        timer = setTimeout(Tick, 280);
        return;
      }

      timer = setTimeout(Tick, 28);
    };

    timer = setTimeout(Tick, 400);
    return () => clearTimeout(timer);
  }, [IsActive]);

  return Placeholder;
};
