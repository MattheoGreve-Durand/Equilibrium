import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour détecter l'appui sur la touche Shift.
 * Retourne true si Shift est maintenu enfoncé.
 */
export function useShiftKey() {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };
    

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    

    // Nettoyage des écouteurs au démontage
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return isShiftPressed;
}

export function useMouseClick() {
    const [isMouseButtonPressed, setIsMouseButtonPressed] = useState(false);

    useEffect(() => {
        const onMouseDown = (e) => {
            setIsMouseButtonPressed(true);
        };

        const onMouseUp = (e) => {
            setIsMouseButtonPressed(false);
        }

       

        return () => {
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        };
    }, []);

    return isMouseButtonPressed;
}