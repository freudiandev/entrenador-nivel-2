"use client";

import { useEffect, useMemo, useState } from "react";
import {
    THEORY_FALLBACK,
    calculateMinScore,
    createSessionQuestions,
    prepareQuiz,
    Option,
    Question,
} from "@/lib/quiz";

type Status = "idle" | "running" | "finished";

type Feedback = {
    correct: boolean;
    text: string;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function withBasePath(path: string) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${BASE_PATH}${normalized}`;
}

async function fetchText(path: string) {
    const res = await fetch(withBasePath(path));
    if (!res.ok) {
        throw new Error(`No se pudo cargar ${path}`);
    }
    return res.text();
}

export default function HomePage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questionBank, setQuestionBank] = useState<Question[]>([]);
    const [distractorPool, setDistractorPool] = useState<string[]>([]);

    const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [status, setStatus] = useState<Status>("idle");

    useEffect(() => {
        const load = async () => {
            try {
                const [questionsText, theoryText] = await Promise.all([
                    fetchText("/data/question-bank.txt"),
                    fetchText("/data/theory.txt"),
                ]);
                const { questionBank, distractorPool } = prepareQuiz(
                    questionsText,
                    theoryText,
                );
                if (!questionBank.length) {
                    throw new Error("No se encontraron preguntas en el banco.");
                }
                setQuestionBank(questionBank);
                setDistractorPool(distractorPool);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar los datos.",
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const currentQuestion = sessionQuestions[currentIndex];
    const totalQuestions = sessionQuestions.length;
    const minScore = useMemo(
        () => calculateMinScore(totalQuestions || 1),
        [totalQuestions],
    );

    const startQuiz = () => {
        if (!questionBank.length) {
            setError("No hay preguntas disponibles.");
            return;
        }
        setSessionQuestions(createSessionQuestions(questionBank, distractorPool));
        setCurrentIndex(0);
        setScore(0);
        setAnswered(false);
        setSelectedId(null);
        setFeedback(null);
        setStatus("running");
    };

    const handleAnswer = (option: Option) => {
        if (!currentQuestion || answered) {
            return;
        }
        setAnswered(true);
        setSelectedId(option.id);
        const isCorrect = option.isCorrect;
        setScore((prev) => prev + (isCorrect ? 1 : 0));
        setFeedback({
            correct: isCorrect,
            text: isCorrect
                ? "Correcto."
                : `Incorrecto.\nLa respuesta correcta es: ${currentQuestion.ans}.\n\nFundamento:\n${currentQuestion.exp || THEORY_FALLBACK}`,
        });
    };

    const handleNext = () => {
        if (!answered) {
            return;
        }
        const isLast = currentIndex === sessionQuestions.length - 1;
        if (isLast) {
            setStatus("finished");
            return;
        }
        setCurrentIndex((prev) => prev + 1);
        setAnswered(false);
        setSelectedId(null);
        setFeedback(null);
    };

    const handleRestart = () => {
        startQuiz();
    };

    const handleBackToStart = () => {
        setStatus("idle");
        setSessionQuestions([]);
        setScore(0);
        setCurrentIndex(0);
        setAnswered(false);
        setSelectedId(null);
        setFeedback(null);
    };

    const renderOptions = () => {
        if (!currentQuestion) return null;
        return currentQuestion.ops.map((option) => {
            const isSelected = selectedId === option.id;
            const classes = [
                "option-btn",
                answered ? "disabled" : "",
                answered && option.isCorrect ? "correct" : "",
                answered && isSelected && !option.isCorrect ? "wrong" : "",
            ]
                .filter(Boolean)
                .join(" ");

            return (
                <button
                    key={option.id}
                    type="button"
                    className={classes}
                    onClick={() => handleAnswer(option)}
                    disabled={answered}
                >
                    {option.text}
                </button>
            );
        });
    };

    const renderStats = () => {
        if (status !== "running") return null;
        return (
            <div className="stats-bar">
                <span>
                    Pregunta {currentIndex + 1}/{totalQuestions || "--"}
                </span>
                <span>Puntaje: {score}</span>
            </div>
        );
    };

    const renderFeedback = () => {
        if (!feedback) return null;
        return (
            <div
                className={`feedback-area ${feedback.correct ? "" : "error-mode"}`}
                aria-live="polite"
            >
                <h4 style={{ margin: 0 }}>Análisis de respuesta</h4>
                <p>{feedback.text}</p>
                <div className="controls">
                    <button
                        className="btn"
                        type="button"
                        onClick={handleNext}
                        disabled={!answered}
                    >
                        {currentIndex === sessionQuestions.length - 1
                            ? "Finalizar ➤"
                            : "Siguiente ➤"}
                    </button>
                </div>
            </div>
        );
    };

    const loadingBlock = loading ? (
        <div className="loading">
            <span className="spinner" aria-hidden="true" />
            Cargando banco oficial...
        </div>
    ) : null;

    const errorBlock = error ? <p className="muted">{error}</p> : null;

    const renderStart = () => (
        <div className="screen">
            <div style={{ textAlign: "center", padding: "18px" }}>
                <h2>Entrenamiento Táctico Intensivo</h2>
                <p>
                    El sistema genera un simulador completo con el banco oficial de
                    Nivel II. Las preguntas y opciones se aleatorizan para que el
                    aprendizaje sea real, no memorístico.
                </p>
                <div className="info-box" style={{ display: "inline-block", textAlign: "left" }}>
                    <strong>Reglas de juego</strong>
                    <ul>
                        <li>Debes responder todas las preguntas.</li>
                        <li>Las opciones cambian de lugar en cada sesión.</li>
                        <li>Nota mínima de aprobación: 80%.</li>
                        <li>Si fallas, verás la justificación teórica.</li>
                    </ul>
                </div>
                <div style={{ marginTop: "20px" }}>
                    {loadingBlock}
                    {errorBlock}
                </div>
                <div style={{ marginTop: "22px" }}>
                    <button
                        className="btn"
                        type="button"
                        onClick={startQuiz}
                        disabled={loading || !!error}
                    >
                        Iniciar Entrenamiento
                    </button>
                </div>
            </div>
        </div>
    );

    const renderQuiz = () => {
        if (!currentQuestion) return null;
        return (
            <div className="screen">
                <div className="question-card">
                    <span className="category-tag">{currentQuestion.cat}</span>
                    <div className="question-text">{currentQuestion.t}</div>
                </div>
                <div className="options-grid">{renderOptions()}</div>
                {renderFeedback()}
            </div>
        );
    };

    const renderResult = () => {
        const total = sessionQuestions.length;
        const passed = score >= minScore;
        return (
            <div className="screen">
                <div className="result-box">
                    <h2>{passed ? "Aprobado" : "Necesitas reforzar"}</h2>
                    <div className={`score-display ${passed ? "" : "fail"}`}>
                        {score}/{total}
                    </div>
                    <p style={{ fontSize: "1.1rem" }}>
                        {passed
                            ? "Buen trabajo. Mantén la disciplina y repasa los puntos críticos."
                            : `No alcanzaste la nota mínima (${minScore}/${total}). Refuerza la teoría y vuelve a intentarlo.`}
                    </p>
                    <div className="controls" style={{ justifyContent: "center" }}>
                        <button className="btn" type="button" onClick={handleRestart}>
                            Practicar de nuevo
                        </button>
                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={handleBackToStart}
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-wrap">
            <div className="quiz-shell">
                <header>
                    <h1>🛡️ Simulador Nivel II: Seguridad Privada</h1>
                    <div className="subtitle">
                        Banco oficial, retroalimentación con teoría y nota mínima del 80%
                    </div>
                </header>
                {renderStats()}
                {status === "idle" && renderStart()}
                {status === "running" && renderQuiz()}
                {status === "finished" && renderResult()}
            </div>
        </div>
    );
}
