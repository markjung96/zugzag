"use client"

import { useState } from "react"
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider, signOut } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { AppProgressBar } from "next-nprogress-bar"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { getErrorMessage } from "@/lib/utils/get-error-message"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            // 401 Unauthorized → auto signout
            const errWithCode = error as Error & { code?: string }
            if (errWithCode.code === "UNAUTHORIZED") {
              signOut({ callbackUrl: "/login" })
              return
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              if (failureCount >= 3) return false
              // Network errors only (TypeError = fetch failed)
              if (error instanceof TypeError) return true
              // Don't retry auth/permission errors
              const errWithCode = error as Error & { code?: string }
              if (errWithCode.code === "UNAUTHORIZED" || errWithCode.code === "FORBIDDEN") return false
              return false
            },
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProgressBar
            height="3px"
            color="hsl(var(--primary))"
            options={{ showSpinner: false }}
            shallowRouting
          />
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            duration={2000}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
