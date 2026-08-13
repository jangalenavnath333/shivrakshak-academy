import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://shivrakshak-academy1-kappa.vercel.app'),
  title: 'शिवरक्षक करिअर अकॅडमी | Army, Police & Defence Training Ahilyanagar',
  description:
    'माजी सैनिकांद्वारे संचलित — अहिल्यानगरमधील Army, Police, SRPF व लेखी परीक्षा प्रशिक्षण. मैदानी सराव, अनुभवी मार्गदर्शन आणि शिस्तबद्ध तयारी. Udyam नोंदणीकृत.',
  keywords: 'shivrakshak academy, army bharti, police bharti, SRPF, agniveer, ahilyanagar, ahmednagar, defence training',
  openGraph: {
    title: 'शिवरक्षक करिअर अकॅडमी | Army, Police & Defence Training',
    description: 'माजी सैनिकांद्वारे संचलित — अहिल्यानगरमधील Army, Police व SRPF भरती प्रशिक्षण.',
    locale: 'mr_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mr">
      <body>{children}</body>
    </html>
  );
}
