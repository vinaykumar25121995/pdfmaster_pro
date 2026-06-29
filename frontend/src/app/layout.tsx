import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'PDFMaster Pro - Edit, Convert, Read and OCR PDFs in Seconds',
  description: 'Professional PDF tools powered by advanced OCR and AI technology. Edit text, annotate documents, merge, split, and convert file formats online or offline.',
  keywords: ['PDF Editor', 'OCR PDF', 'PDF Reader', 'PDF Converter', 'Edit PDF Online', 'PDF Merge', 'PDF Split', 'E-Signature'],
  authors: [{ name: 'DeepMind Advanced Agentic Coding team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
