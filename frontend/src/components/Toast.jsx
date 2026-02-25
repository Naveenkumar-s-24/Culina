import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 3000) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
            );
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 300);
        }, duration);
    }, []);

    const toast = useCallback(
        {
            success: (msg) => addToast(msg, "success"),
            error: (msg) => addToast(msg, "error"),
            info: (msg) => addToast(msg, "info"),
            warning: (msg) => addToast(msg, "warning"),
        },
        [addToast]
    );

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`toast toast-${t.type} ${t.exiting ? "exiting" : ""}`}
                    >
                        <span className="toast-icon">
                            {t.type === "success" && "✅"}
                            {t.type === "error" && "❌"}
                            {t.type === "info" && "💡"}
                            {t.type === "warning" && "⚠️"}
                        </span>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
