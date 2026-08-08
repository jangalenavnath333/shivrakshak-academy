import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "शिवरक्षक करियर अकॅडमी",
  description: "महाराष्ट्रातील सर्वोत्तम पोलीस व आर्मी भरती प्रशिक्षण संस्था — अहमदनगर",
  keywords: "shivrakshak academy, army bharti, police bharti, ahmednagar",
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
