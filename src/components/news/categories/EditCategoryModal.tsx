"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName?: string;
  title?: string;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialName = "",
  title = "تعديل التصنيف",
}: EditCategoryModalProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white dark:bg-[#0a0e19] rounded-lg shadow-lg p-6">
          <Dialog.Title className="text-xl font-semibold mb-4 text-right">
            {title}
          </Dialog.Title>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-right text-black dark:text-white">
                اسم التصنيف
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 dark:border-[#172036] px-3 py-2 rounded-md bg-white dark:bg-[#0c1427] text-black dark:text-white focus:outline-none focus:ring focus:ring-primary-500"
                placeholder="اكتب اسم التصنيف"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 dark:hover:bg-[#1a2332]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600"
              >
                حفظ
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
