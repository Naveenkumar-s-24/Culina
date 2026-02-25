import { useState, useRef, useEffect } from "react";

export default function CookTimeDial({ time, onChange }) {
    const [isDragging, setIsDragging] = useState(false);
    const dialRef = useRef(null);

    const handleInteraction = (clientX, clientY) => {
        if (!dialRef.current) return;
        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate angle from center
        const x = clientX - centerX;
        const y = clientY - centerY;
        let angle = Math.atan2(y, x) * (180 / Math.PI);

        // Adjust to start from top (usually -90 deg)
        // atan2 gives -180 to 180. 0 is right (3 o'clock).
        // We want 12 o'clock to be 0 minutes.
        angle = (angle + 90 + 360) % 360;

        // Map 0-360 degrees to 0-120 minutes (or however long we want max)
        // Let's say max is 120 mins.
        // 360 degrees = 120 mins
        // min = degrees / 3

        let mins = Math.round(angle / 3);

        // Snap to 5 min increments
        mins = Math.round(mins / 5) * 5;
        if (mins === 0) mins = 120; // Allow wrapping or full circle to be max? 
        // Actually typically a dial shouldn't wrap instantly from 0 to max if standard behavior.

        onChange(mins);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        handleInteraction(e.clientX, e.clientY);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            handleInteraction(e.clientX, e.clientY);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    // Calculate rotation for the knob based on time
    // time 0-120 -> 0-360 deg
    const rotation = (time / 120) * 360;

    return (
        <div style={styles.container}>
            <h3 style={styles.label}>Max Cook Time</h3>
            <div
                ref={dialRef}
                style={styles.dial}
                onMouseDown={handleMouseDown}
            >
                {/* Tick marks */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            ...styles.tick,
                            transform: `rotate(${i * 30}deg)`,
                        }}
                    />
                ))}

                {/* Active arc (SVG) */}
                <svg style={styles.svg} viewBox="0 0 100 100">
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                    />
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="8"
                        strokeDasharray={`${(time / 120) * 283} 283`} // 2*pi*r = 2*3.14*45 ≈ 283
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                    />
                </svg>

                {/* Knob */}
                <div
                    style={{
                        ...styles.knob,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    }}
                >
                    <div style={styles.knobHandle} />
                </div>

                {/* Center Text */}
                <div style={styles.centerText}>
                    <span style={styles.timeValue}>{time}</span>
                    <span style={styles.timeUnit}>min</span>
                </div>
            </div>
            <p style={styles.helper}>Drag to adjust</p>
        </div>
    );
}

const styles = {
    container: {
        padding: "16px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "16px",
    },
    label: {
        margin: "0 0 12px 0",
        fontSize: "0.8rem",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    dial: {
        width: "120px",
        height: "120px",
        position: "relative",
        cursor: "grab",
        borderRadius: "50%",
        touchAction: "none",
    },
    svg: {
        width: "100%",
        height: "100%",
        transform: "rotate(0deg)",
        pointerEvents: "none",
    },
    tick: {
        position: "absolute",
        top: "0",
        left: "50%",
        width: "2px",
        height: "6px",
        background: "rgba(255,255,255,0.2)",
        transformOrigin: "50% 60px", // Half of dial size
        marginLeft: "-1px",
    },
    knob: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
    },
    knobHandle: {
        width: "16px",
        height: "16px",
        background: "#fff",
        borderRadius: "50%",
        position: "absolute",
        top: "6px", // Offset from edge
        left: "50%",
        transform: "translateX(-50%)",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    },
    centerText: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
    },
    timeValue: {
        fontSize: "1.5rem",
        fontWeight: "800",
        color: "#f1f5f9",
        lineHeight: 1,
    },
    timeUnit: {
        fontSize: "0.7rem",
        color: "#64748b",
    },
    helper: {
        fontSize: "0.7rem",
        color: "#475569",
        margin: "8px 0 0 0",
    }
};
