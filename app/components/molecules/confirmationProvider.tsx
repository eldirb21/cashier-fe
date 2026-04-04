"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
 import { HiCheckCircle, HiXCircle, HiInformationCircle } from "react-icons/hi";
import { Confirmation } from "./confirmation";

type AlertType = "success" | "error" | "info";

type ContextType = {
  confirm: (config: {
    type?: "info" | "danger" | "error" | "confirm";
    title?: string;
    message?: string;
    onSave: () => void;
  }) => void;
  showAlert: (message: string, type?: AlertType) => void;
};

const ConfirmationContext = createContext<ContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  // State untuk Confirmation Modal
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>({});

  // State untuk Toast Alert
  const [alert, setAlert] = useState<{ message: string; type: AlertType; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Fungsi memicu Modal Konfirmasi
  const confirm = (config: any) => {
    setModalConfig(config);
    setShowModal(true);
  };

  // Fungsi memicu Toast Alert (Auto-hide)
  const showAlert = (message: string, type: AlertType = "success") => {
    setAlert({ message, type, visible: true });
  };

  // Efek auto-hide Toast setelah 3 detik
  useEffect(() => {
    if (alert.visible) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.visible]);

  return (
    <ConfirmationContext.Provider value={{ confirm, showAlert }}>
      {children}

      {/* 1. Render Modal Konfirmasi */}
      <Confirmation
        visible={showModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setShowModal(false)}
        onSave={() => {
          modalConfig.onSave();
          setShowModal(false);
        }}
      />

      {/* 2. Render Toast Alert (Floating) */}
      <div className={`fixed top-10 right-1/2 translate-x-1/2 md:right-10 md:translate-x-0 z-[200] transition-all duration-500 ease-in-out ${
        alert.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"
      }`}>
        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border min-w-[300px] ${
          alert.type === "success" ? "bg-white border-green-100 text-green-800" : 
          alert.type === "error" ? "bg-white border-red-100 text-red-800" : 
          "bg-white border-blue-100 text-blue-800"
        }`}>
          {alert.type === "success" && <HiCheckCircle className="text-green-500" size={28} />}
          {alert.type === "error" && <HiXCircle className="text-red-500" size={28} />}
          {alert.type === "info" && <HiInformationCircle className="text-blue-500" size={28} />}
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{alert.type}</span>
            <span className="text-sm font-extrabold tracking-tight">{alert.message}</span>
          </div>
        </div>
      </div>
    </ConfirmationContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmationProvider");
  return context;
};