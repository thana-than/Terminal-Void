import '/src/css/os.css';
import React, { useEffect } from "react";
import { createRoot } from 'react-dom/client';
import { createPortal } from "react-dom";

function FloatingOverlayComponent({ children, duration = 2000, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return createPortal(
        <div className="overlay">
            {children}
        </div>,
        document.body
    );
}

export default function FloatingOverlay(component, duration) {
    const container = document.getElementById("overlay-root");
    const root = createRoot(container);

    root.render(
        <FloatingOverlayComponent duration={duration} onClose={() => root.unmount()}>
            {component}
        </FloatingOverlayComponent>
    );
}