import { useEffect } from "react";
import "./Notification.css";

const DURATION_MS = 4000;

function Notification({ notification, onClose }) {
    // Auto-close. The cleanup cancels the old timer when a new
    // notification arrives, so timers never overlap.
    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(onClose, DURATION_MS);
        return () => clearTimeout(timer);
    }, [notification, onClose]);

    return (
        // Always in the page so screen readers announce new messages
        <div className="notification-region" aria-live="polite" aria-atomic="true">
            {notification && (
                <div
                    className={`notification notification--${notification.type}`}
                    key={notification.id}
                >
                    {/* The "indicator" dot, like Frappe's green/red dot */}
                    <span className="notification__dot" aria-hidden="true" />
                    <p className="notification__message">{notification.message}</p>
                    <button
                        type="button"
                        className="notification__close"
                        onClick={onClose}
                        aria-label="Dismiss notification"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}

export default Notification;