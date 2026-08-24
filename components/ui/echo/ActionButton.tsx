"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type ActionType = "primary" | "destructive"

interface ActionButtonProps extends React.ComponentProps<"button"> {
  label: string
  actionType?: ActionType
  onExecute?: () => void | Promise<void>
  loading?: boolean
  executed?: boolean
}

const ACTION_STYLES: Record<ActionType, { idle: string; loading: string; done: string }> = {
  primary: {
    idle: "bg-primary text-primary-foreground hover:bg-primary/90",
    loading: "bg-primary/70 text-primary-foreground cursor-wait",
    done: "bg-success text-white",
  },
  destructive: {
    idle: "bg-danger text-white hover:bg-danger/90",
    loading: "bg-danger/70 text-white cursor-wait",
    done: "bg-success text-white",
  },
}

export function ActionButton({
  label,
  actionType = "primary",
  onExecute,
  loading: externalLoading,
  executed: externalExecuted,
  disabled,
  className,
  ...props
}: ActionButtonProps) {
  const [internalState, setInternalState] = React.useState<"idle" | "loading" | "done">("idle")
  const [internalExecuted, setInternalExecuted] = React.useState(false)

  const isLoading = externalLoading ?? internalState === "loading"
  const isDone = externalExecuted ?? internalExecuted
  const currentState = isDone ? "done" : isLoading ? "loading" : "idle"

  const styles = ACTION_STYLES[actionType]

  React.useEffect(() => {
    if (internalExecuted && internalState === "done") {
      const timer = setTimeout(() => {
        setInternalExecuted(false)
        setInternalState("idle")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [internalExecuted, internalState])

  async function handleClick() {
    if (isLoading || isDone || disabled) return

    setInternalState("loading")
    try {
      await onExecute?.()
    } finally {
      setInternalState("done")
      setInternalExecuted(true)
    }
  }

  return (
    <button
      data-slot="action-button"
      data-state={currentState}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
        styles[currentState],
        (isLoading || isDone || disabled) && "pointer-events-none",
        className
      )}
      disabled={disabled || isLoading || isDone}
      onClick={handleClick}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <Loader2 className="size-3.5 animate-spin" />
            <span>Processing</span>
          </motion.span>
        ) : isDone ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <Check className="size-3.5" />
            <span>Done</span>
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
