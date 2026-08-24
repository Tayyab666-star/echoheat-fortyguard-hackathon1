"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"

interface DashboardLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  breadcrumbs?: string[]
}

export function DashboardLayout({
  children,
  pageTitle,
  breadcrumbs,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <motion.div
        animate={{ marginLeft: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="flex min-h-screen flex-col"
      >
        <Topbar pageTitle={pageTitle} breadcrumbs={breadcrumbs} />

        <main
          className={cn(
            "flex-1 bg-grid p-6",
            "transition-[padding] duration-300 ease-out"
          )}
        >
          {children}
        </main>
      </motion.div>
    </div>
  )
}
