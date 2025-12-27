import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Entrenador Táctico Nivel II",
    description:
        "Simulador de preguntas Nivel II con feedback teórico para guardias de seguridad.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}
