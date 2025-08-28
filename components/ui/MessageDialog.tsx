"use client";

import React from "react";

export type MessageType = "success" | "error" | "info";

interface MessageDialogProps {
  open: boolean;
  type?: MessageType;
  title?: string;
  message: string;
  onClose: () => void;
}

const stylesByType: Record<MessageType, { header: string; icon: React.ReactNode }> = {
  success: {
    header: "text-green-700",
    icon: (
      <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    header: "text-red-700",
    icon: (
      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  info: {
    header: "text-blue-700",
    icon: (
      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 18a6 6 0 100-12 6 6 0 000 12z" />
      </svg>
    ),
  },
};

export default function MessageDialog({ open, type = "info", title, message, onClose }: MessageDialogProps) {
  if (!open) return null;
  const { header, icon } = stylesByType[type];

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <div className="flex items-center gap-3 px-5 py-4">
          {icon}
          <h3 className={`text-lg font-semibold ${header}`}>{title || (type === "success" ? "Success" : type === "error" ? "Error" : "Notice")}</h3>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <div className="px-5 py-4 text-gray-800">{message}</div>
        <div className="flex justify-end gap-2 px-5 pb-4">
          <button onClick={onClose} className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">OK</button>
        </div>
      </div>
    </div>
  );
}
