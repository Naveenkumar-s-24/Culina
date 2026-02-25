import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/recipesApi";

const Typewriter = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => prev + text[index]);
                setIndex(prev => prev + 1);
            }, 10); // Fast speed
            return () => clearTimeout(timer);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, text, onComplete]);

    return <div>{displayedText}</div>;
};

/**
 * CulBot: Premium Conversational Intelligence UI
 */
export default function ChatBot({ onSelectRecipe, isOpen, onClose }) {
    const [messages, setMessages] = useState([
        {
            id: "initial",
            type: "bot",
            text: "Hello! I'm CulBot, your culinary reasoning assistant. I can help you find recipes, compare cuisines, or analyze trade-offs between time and quality. How can I help you today?",
            role: "companion",
            isTyping: false
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!inputValue.trim() || isThinking) return;

        const userMsg = { id: Date.now(), type: "user", text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsThinking(true);

        try {
            const response = await sendChatMessage(inputValue);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: "bot",
                ...response,
                isTyping: true
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: "bot",
                text: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
                isError: true,
                isTyping: true
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.container}>
            <div style={styles.window}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerTitle}>
                        <span style={styles.botIcon}>🧠</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>CulBot</div>
                            <div style={{ fontSize: "0.7rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={styles.onlineDot} /> Online & Reasoning
                            </div>
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Messages Area */}
                <div style={styles.messagesArea} ref={scrollRef}>
                    {messages.map((msg, i) => (
                        <div key={msg.id} style={{
                            ...styles.messageRow,
                            justifyContent: msg.type === "user" ? "flex-end" : "flex-start"
                        }}>
                            {msg.type === "bot" && <span style={styles.msgAvatar}>🤖</span>}
                            <div style={{
                                ...styles.bubble,
                                ...(msg.type === "user" ? styles.userBubble : styles.botBubble),
                                ...(msg.isError ? { borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.1)" } : {})
                            }}>
                                {/* Reasoning Display */}
                                {msg.reasoning && msg.reasoning.length > 0 && (
                                    <div style={styles.reasoningBox}>
                                        <div style={styles.reasoningHeader}>💭 Reasoning Engine</div>
                                        {msg.reasoning.map((step, idx) => (
                                            <div key={idx} style={styles.reasoningStep}>↳ {step}</div>
                                        ))}
                                    </div>
                                )}

                                <div style={styles.msgText}>
                                    {msg.isTyping ? (
                                        <Typewriter
                                            text={msg.text}
                                            onComplete={() => {
                                                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isTyping: false } : m));
                                            }}
                                        />
                                    ) : (
                                        msg.text
                                    )}
                                </div>

                                {/* Recipe Data */}
                                {msg.data && (
                                    <div style={styles.recipeGrid}>
                                        {msg.data.map(recipe => (
                                            <div
                                                key={recipe.id}
                                                style={styles.recipeMiniCard}
                                                onClick={() => onSelectRecipe(recipe)}
                                            >
                                                <div style={styles.miniTitle}>{recipe.title}</div>
                                                <div style={styles.miniMeta}>
                                                    <span>⭐ {recipe.rating || "N/A"}</span>
                                                    <span>⏱️ {recipe.total_time}m</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Comparison Stats */}
                                {msg.stats && (
                                    <div style={styles.comparisonTable}>
                                        {Object.entries(msg.stats).map(([name, s]) => (
                                            <div key={name} style={styles.statRow}>
                                                <div style={{ fontWeight: 600 }}>{name}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                                    Rating: {s.rating} | Time: {s.time}m
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div style={styles.messageRow}>
                            <span style={styles.msgAvatar}>🤖</span>
                            <div style={{ ...styles.bubble, ...styles.botBubble }}>
                                <div style={styles.typing}>
                                    <div style={styles.dot} />
                                    <div style={{ ...styles.dot, animationDelay: "0.2s" }} />
                                    <div style={{ ...styles.dot, animationDelay: "0.4s" }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div style={styles.inputArea}>
                    <div style={styles.inputWrapper}>
                        <input
                            style={styles.input}
                            placeholder="Ask about recipes, cuisines..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                        />
                        <button
                            style={{
                                ...styles.sendBtn,
                                opacity: inputValue.trim() ? 1 : 0.5
                            }}
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isThinking}
                        >
                            ➔
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: 1000,
        fontFamily: "'Inter', sans-serif",
    },
    window: {
        width: "400px",
        height: "550px",
        background: "rgba(15, 17, 23, 0.85)",
        backdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "ChatBot_slideInUp 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
    },
    header: {
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.02)",
    },
    headerTitle: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    botIcon: {
        width: "34px",
        height: "34px",
        background: "rgba(249, 115, 22, 0.1)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        border: "1px solid rgba(249, 115, 22, 0.2)",
    },
    onlineDot: {
        width: "6px",
        height: "6px",
        background: "#10b981",
        borderRadius: "50%",
        boxShadow: "0 0 8px #10b981",
    },
    closeBtn: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        fontSize: "18px",
        cursor: "pointer",
        padding: "8px",
        borderRadius: "50%",
        transition: "background 0.2s",
    },
    messagesArea: {
        flex: 1,
        padding: "20px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        scrollBehavior: "smooth",
    },
    messageRow: {
        display: "flex",
        gap: "10px",
        maxWidth: "90%",
    },
    msgAvatar: {
        fontSize: "18px",
        marginTop: "4px",
    },
    bubble: {
        padding: "12px 16px",
        borderRadius: "18px",
        fontSize: "0.88rem",
        lineHeight: "1.5",
        position: "relative",
    },
    botBubble: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#cbd5e1",
        borderTopLeftRadius: "4px",
    },
    userBubble: {
        background: "linear-gradient(135deg, #f97316, #fb923c)",
        color: "#fff",
        borderTopRightRadius: "4px",
        boxShadow: "0 4px 15px rgba(249, 115, 22, 0.2)",
    },
    reasoningBox: {
        background: "rgba(0, 0, 0, 0.3)",
        borderRadius: "10px",
        padding: "8px 12px",
        marginBottom: "10px",
        fontSize: "0.72rem",
        border: "1px solid rgba(255, 255, 255, 0.05)",
    },
    reasoningHeader: {
        color: "#f97316",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "4px",
    },
    reasoningStep: {
        color: "#94a3b8",
        fontFamily: "monospace",
    },
    msgText: {
        whiteSpace: "pre-wrap",
    },
    recipeGrid: {
        marginTop: "12px",
        display: "grid",
        gap: "8px",
    },
    recipeMiniCard: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "10px",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    miniTitle: {
        fontSize: "0.8rem",
        fontWeight: 600,
        color: "#f1f5f9",
        marginBottom: "4px",
    },
    miniMeta: {
        fontSize: "0.7rem",
        color: "#94a3b8",
        display: "flex",
        gap: "10px",
    },
    comparisonTable: {
        marginTop: "12px",
        background: "rgba(0,0,0,0.2)",
        borderRadius: "12px",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    statRow: {
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        paddingBottom: "4px",
    },
    inputArea: {
        padding: "16px 20px",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    },
    inputWrapper: {
        display: "flex",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "14px",
        padding: "2px 2px 2px 14px",
        gap: "10px",
    },
    input: {
        flex: 1,
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: "0.85rem",
        outline: "none",
        padding: "10px 0",
    },
    sendBtn: {
        width: "36px",
        height: "36px",
        borderRadius: "12px",
        background: "#f97316",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
    },
    typing: {
        display: "flex",
        gap: "4px",
        padding: "8px 0",
    },
    dot: {
        width: "6px",
        height: "6px",
        background: "#94a3b8",
        borderRadius: "50%",
        animation: "ChatBot_pulse 1.5s infinite ease-in-out",
    }
};
