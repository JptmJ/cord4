import './globals.css';
import { connectDB } from '../lib/db';

export const metadata = {
  title: 'Payout Manager',
  description: 'Payout Management MVP',
  icons: {
    icon: '/download.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connectDB();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
