import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, STORE_NAME } from "@/components/site-header";
import "./globals.css";

const thai = IBM_Plex_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${STORE_NAME} — อะไหล่รถยนต์ ค้นหาตามรุ่นรถและหมายเลขอะไหล่`, template: `%s | ${STORE_NAME}` },
  description: "ร้านอะไหล่รถยนต์ออนไลน์ ค้นหาจากยี่ห้อ รุ่น ปี เครื่องยนต์ หรือหมายเลขอะไหล่/OEM แสดงความเข้ากันได้พร้อมแหล่งอ้างอิง",
};

export const viewport: Viewport = { themeColor: "#12355b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${thai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
