"use client";

import React from "react";
import { Dialog } from "@headlessui/react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "تأكيد الحذف",
  description = "هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white dark:bg-[#0a0e19] rounded-lg shadow-lg p-6">
          <Dialog.Title className="text-lg font-semibold mb-3 text-right">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm mb-5 text-right text-gray-600 dark:text-gray-300">
            {description}
          </Dialog.Description>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:hover:bg-[#1a2332]"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded-md bg-danger-500 text-white hover:bg-danger-600"
            >
              تأكيد الحذف
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
