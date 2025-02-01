import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import "@/styles/auth.css";
import AppProvider from "@/providers/AppProvider"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "MandApp",
  description: "Your Language Learning Companion",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions);
  const headersList = await headers();
  const pathname = (await headersList.get("x-invoke-path")) || "";
  const isAuthPage = pathname.startsWith("/auth");
  const showSidebar = session && !isAuthPage;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} min-h-screen flex flex-col bg-background`}>
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            {!isAuthPage && <Navbar />}
            <main className="flex-1 flex">
              {showSidebar && <Sidebar />}
              <div className={cn("flex-1", isAuthPage && "min-h-screen")}>
                {children}
              </div>
            </main>
            {!isAuthPage && <Footer />}
          </div>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  )
}
