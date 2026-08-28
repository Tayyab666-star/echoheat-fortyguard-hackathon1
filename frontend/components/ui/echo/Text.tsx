"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextBaseProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
}

/* ── PageTitle ── heading1, bold, tracking-tight ────────── */
export const PageTitle = React.forwardRef<HTMLHeadingElement, TextBaseProps>(
  ({ className, children, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "font-bold tracking-tight text-text-primary",
        className
      )}
      style={{ fontSize: "var(--text-heading1)" }}
      {...props}
    >
      {children}
    </h1>
  )
)
PageTitle.displayName = "PageTitle"

/* ── SectionTitle ── heading2, semibold ─────────────────── */
export const SectionTitle = React.forwardRef<HTMLHeadingElement, TextBaseProps>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "font-semibold text-text-primary",
        className
      )}
      style={{ fontSize: "var(--text-heading2)" }}
      {...props}
    >
      {children}
    </h2>
  )
)
SectionTitle.displayName = "SectionTitle"

/* ── CardTitle ── heading3, semibold ────────────────────── */
export const CardTitle = React.forwardRef<HTMLHeadingElement, TextBaseProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-semibold text-text-primary",
        className
      )}
      style={{ fontSize: "var(--text-heading3)" }}
      {...props}
    >
      {children}
    </h3>
  )
)
CardTitle.displayName = "CardTitle"

/* ── Body ── body, secondary, leading-relaxed ───────────── */
export const Body = React.forwardRef<HTMLParagraphElement, TextBaseProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "leading-relaxed text-text-secondary",
        className
      )}
      style={{ fontSize: "var(--text-body)" }}
      {...props}
    >
      {children}
    </p>
  )
)
Body.displayName = "Body"

/* ── Caption ── small, muted, leading-normal ────────────── */
export const Caption = React.forwardRef<HTMLSpanElement, TextBaseProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "leading-normal text-text-muted",
        className
      )}
      style={{ fontSize: "var(--text-small)" }}
      {...props}
    >
      {children}
    </span>
  )
)
Caption.displayName = "Caption"

/* ── DataLabel ── xs, muted, medium, uppercase, wide ───── */
export const DataLabel = React.forwardRef<HTMLSpanElement, TextBaseProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "font-medium uppercase tracking-widest text-text-muted",
        className
      )}
      style={{ fontSize: "var(--text-xs)" }}
      {...props}
    >
      {children}
    </span>
  )
)
DataLabel.displayName = "DataLabel"

/* ── MetricValue ── display, mono, black ────────────────── */
export const MetricValue = React.forwardRef<HTMLSpanElement, TextBaseProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "font-black font-mono text-text-primary tabular-nums",
        className
      )}
      style={{ fontSize: "var(--text-display)" }}
      {...props}
    >
      {children}
    </span>
  )
)
MetricValue.displayName = "MetricValue"

/* ── Code ── mono, accent, surface-2 bg ─────────────────── */
export const Code = React.forwardRef<HTMLElement, TextBaseProps>(
  ({ className, children, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(
        "rounded-md bg-surface-2 px-1.5 py-0.5 text-accent font-mono",
        className
      )}
      style={{ fontSize: "var(--text-mono)" }}
      {...props}
    >
      {children}
    </code>
  )
)
Code.displayName = "Code"
