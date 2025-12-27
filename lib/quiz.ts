export type Option = {
    id: string;
    text: string;
    isCorrect: boolean;
};

export type Question = {
    id: string;
    t: string;
    ops: Option[];
    ans: string;
    cat: string;
    exp: string;
};

export const THEORY_FALLBACK = "Consulta el material del Nivel II para este tema.";

const STOP_WORDS = new Set([
    "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "u",
    "que", "como", "cuando", "donde", "para", "por", "con", "sin", "sobre",
    "al", "del", "se", "es", "son", "ser", "su", "sus", "en", "a", "ya", "si",
    "cual", "quien", "quienes", "este", "esta", "estos", "estas",
]);

const MODULE_RULES = [
    {
        name: "Módulo I: Equipos de Protección",
        keywords: [
            "epp", "equipo de proteccion", "uniforme", "credencial", "cinto",
            "chaleco", "casco", "blindaje", "vidrio blindado", "vehiculo blindado",
            "compartimento", "compartimiento", "blindado",
        ],
    },
    {
        name: "Módulo II: Operaciones de Seguridad",
        keywords: ["vigilancia", "contravigilancia", "rutas", "analisis de rutas"],
    },
    {
        name: "Módulo III: Seguridad Ciudadana",
        keywords: [
            "seguridad ciudadana", "seguridad humana", "derechos humanos",
            "violencia", "policia comunitaria", "ecu 911", "sise", "sissecu",
        ],
    },
    {
        name: "Módulo IV: Normativa Vigente",
        keywords: [
            "ley", "coip", "art", "articulo", "licencia", "transito",
            "contravencion", "delito", "flagrancia", "tenencia", "porte",
        ],
    },
    {
        name: "Módulo V: Protección VIP y Custodia",
        keywords: [
            "vip", "escolta", "custodia", "convoy", "carga critica",
            "transporte de valores", "portavalor", "caravana",
        ],
    },
    {
        name: "Módulo VI: Comunicaciones e Información",
        keywords: [
            "radio", "comunicacion", "gps", "gprs", "gsm", "umts",
            "indicativos", "contrasenas", "codigos", "confidencialidad",
            "integridad", "disponibilidad", "informacion",
        ],
    },
    {
        name: "Módulo VII: Manejo de Crisis",
        keywords: ["crisis", "emergencia", "comite de crisis", "accion adaptativa"],
    },
    {
        name: "Módulo VIII: Práctica de Tiro",
        keywords: [
            "arma de fuego", "arma", "revólver", "revolver", "pistola",
            "escopeta", "tiro", "punteria", "disparo", "cañon", "canon",
            "recamara", "gatillo",
        ],
    },
];

export function prepareQuiz(rawQuestions: string, theoryText: string) {
    const questionBank = buildQuestionBank(rawQuestions, theoryText);
    const distractorPool = buildDistractorPool(questionBank);
    return { questionBank, distractorPool };
}

export function createSessionQuestions(
    questionBank: Question[],
    distractorPool: string[],
) {
    return shuffleArray(questionBank).map((question) => {
        const options = question.ops.map((option) => ({ ...option }));
        fillDistractors(options, question, distractorPool);
        return {
            ...question,
            ops: shuffleArray(options),
        };
    });
}

export function calculateMinScore(total: number) {
    return Math.ceil(total * 0.8);
}

export function buildQuestionBank(rawText: string, theoryText: string) {
    const questions: Question[] = [];
    const answerRegex = /ANSWER:\s*([A-D])/g;
    let startIndex = rawText.indexOf("¿");
    if (startIndex === -1) {
        return questions;
    }

    const theoryLower = theoryText.toLowerCase();
    answerRegex.lastIndex = startIndex;

    while (true) {
        const match = answerRegex.exec(rawText);
        if (!match || startIndex === -1) {
            break;
        }
        const block = rawText.slice(startIndex, match.index).trim();
        const parsed = parseQuestionBlock(
            block,
            match[1],
            questions.length,
            theoryText,
            theoryLower,
        );
        if (parsed) {
            questions.push(parsed);
        }
        startIndex = rawText.indexOf("¿", answerRegex.lastIndex);
        if (startIndex === -1) {
            break;
        }
        answerRegex.lastIndex = startIndex;
    }

    return questions;
}

function parseQuestionBlock(
    block: string,
    answerLetter: string,
    index: number,
    theoryText: string,
    theoryLower: string,
): Question | null {
    const condensed = block.replace(/\s+/g, " ").trim();
    const optionRegex = /([A-F])\)\s*/g;
    const matches = Array.from(condensed.matchAll(optionRegex));
    if (!matches.length) {
        return null;
    }

    const questionText = condensed.slice(0, matches[0].index).trim();
    const options: Option[] = [];

    for (let i = 0; i < matches.length; i += 1) {
        const start = matches[i].index + matches[i][0].length;
        const end = i + 1 < matches.length ? matches[i + 1].index : condensed.length;
        const text = condensed.slice(start, end).trim();
        options.push({
            id: matches[i][1],
            text,
            isCorrect: matches[i][1] === answerLetter,
        });
    }

    const correctOption = options.find((option) => option.isCorrect);
    return {
        id: `q-${index}`,
        t: questionText,
        ops: options,
        ans: correctOption ? correctOption.text : `Respuesta ${answerLetter}`,
        cat: categorizeQuestion(questionText),
        exp: findTheorySnippet(
            { t: questionText, ans: correctOption?.text ?? "", ops: options },
            theoryText,
            theoryLower,
        ),
    };
}

function categorizeQuestion(text: string) {
    const normalized = normalizeText(text);
    for (const rule of MODULE_RULES) {
        if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
            return rule.name;
        }
    }
    return "Banco Nivel II";
}

function normalizeText(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[¿?.,;:()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function extractKeywords(text: string) {
    return normalizeText(text)
        .split(" ")
        .filter((word) => word.length >= 5 && !STOP_WORDS.has(word))
        .slice(0, 8);
}

function extractSnippet(text: string, idx: number) {
    let start = text.lastIndexOf("\n", idx);
    let end = text.indexOf("\n", idx);
    if (start === -1) {
        start = 0;
    } else {
        start += 1;
    }
    if (end === -1) {
        end = text.length;
    }
    let snippet = text.slice(start, end).trim();
    if (snippet.length < 40) {
        const nextEnd = text.indexOf("\n", end + 1);
        if (nextEnd !== -1) {
            snippet = text.slice(start, nextEnd).trim();
        }
    }
    if (snippet.length > 700) {
        snippet = `${snippet.slice(0, 700).trim()}...`;
    }
    return snippet;
}

function findTheorySnippet(
    question: Pick<Question, "t" | "ans" | "ops">,
    theoryText: string,
    theoryLower: string,
) {
    const candidates: string[] = [];
    if (question.ans && !question.ans.startsWith("Respuesta")) {
        candidates.push(question.ans);
    }
    candidates.push(question.t);
    candidates.push(...extractKeywords(question.t));
    candidates.push(...extractKeywords(question.ans));

    for (const candidate of candidates) {
        const needle = normalizeText(candidate);
        if (needle.length < 5) {
            continue;
        }
        const idx = theoryLower.indexOf(needle);
        if (idx !== -1) {
            return extractSnippet(theoryText, idx);
        }
    }

    return THEORY_FALLBACK;
}

function buildDistractorPool(questions: Question[]) {
    const pool: string[] = [];
    const seen = new Set<string>();
    questions.forEach((question) => {
        question.ops.forEach((option) => {
            const key = normalizeText(option.text);
            if (!key || seen.has(key)) {
                return;
            }
            seen.add(key);
            pool.push(option.text);
        });
    });
    return pool;
}

function fillDistractors(options: Option[], question: Question, pool: string[]) {
    const normalized = new Set(options.map((option) => normalizeText(option.text)));
    const correctKey = normalizeText(question.ans);
    const candidates = pool.filter((text) => {
        const key = normalizeText(text);
        return key && key !== correctKey && !normalized.has(key);
    });
    while (options.length < 4 && candidates.length) {
        const idx = getRandomInt(candidates.length);
        const text = candidates.splice(idx, 1)[0];
        normalized.add(normalizeText(text));
        options.push({
            id: `X${options.length}`,
            text,
            isCorrect: false,
        });
    }
    while (options.length < 4) {
        options.push({
            id: `F${options.length}`,
            text: `Opción ${options.length + 1}`,
            isCorrect: false,
        });
    }
}

function getRandomInt(max: number) {
    if (max <= 1) {
        return 0;
    }
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        const buffer = new Uint32Array(1);
        const limit = Math.floor(0x100000000 / max) * max;
        let value = 0;
        do {
            crypto.getRandomValues(buffer);
            value = buffer[0];
        } while (value >= limit);
        return value % max;
    }
    return Math.floor(Math.random() * max);
}

function shuffleArray<T>(items: T[]) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = getRandomInt(i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
