import React from 'react';
import { UserDoc } from '../types.js';
import { UploadForm } from './UploadForm.js';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: UserDoc[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  users,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl my-8 animate-in fade-in zoom-in-95 duration-150">
        <UploadForm
          users={users}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
