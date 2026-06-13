import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, hideFooter, children, maxWidth = "w-[95vw] md:w-[80vw] lg:max-w-5xl" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm dark:bg-black/60 p-4">
      <div className={`relative ${maxWidth} rounded-xl bg-white p-6 shadow-2xl dark:bg-dark-900 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh]`}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-dark-800 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="text-slate-600 dark:text-slate-400 overflow-y-auto overflow-x-hidden flex-1 px-1 py-1 custom-scrollbar">
          {children}
        </div>
        
        {!hideFooter && (
          <div className="mt-6 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert(`${title} action successful!`);
                onClose();
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
