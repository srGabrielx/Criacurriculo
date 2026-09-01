import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Construtor de Currículos',
  description: 'Uma plataforma inteligente para criar currículos profissionais otimizados. Inclui templates avançados e importação de documentos via IA.',
  openGraph: {
    title: 'Construtor de Currículos',
    description: 'Uma plataforma inteligente para criar currículos profissionais otimizados. Inclui templates avançados e importação de documentos via IA.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Construtor de Currículos',
    description: 'Uma plataforma inteligente para criar currículos profissionais otimizados. Inclui templates avançados e importação de documentos via IA.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
