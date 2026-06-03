import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, hideFooter, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-dark-800 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>
        <div className="text-slate-600 dark:text-slate-400">
          {children}
        </div>
        {!hideFooter && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert(`${title} action successful!`);
                onClose();
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
