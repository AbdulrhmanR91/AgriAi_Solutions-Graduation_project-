import React, { useEffect, useRef } from 'react';

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  title?: string;
}

const Dialog: React.FC<DialogProps> = ({ 
  open,
  onClose,
  title,
  children 
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto"> {/* Increased z-index */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
          {title && (
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{title}</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ 
  children,
  className = '',
  onClose,
  title
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto"> {/* Increased z-index */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          ref={dialogRef}
          className={`relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto ${className}`}
        >
          {title && (
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{title}</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dialog, DialogContent };
export default Dialog;