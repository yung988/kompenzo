"use client"

import { useState } from "react"
import type { ToastProps } from "@/components/ui/toast"

interface ToasterToast extends ToastProps {
  id: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Toast = Omit<ToasterToast, "id" | "open" | "onOpenChange">

// Create a singleton state for toast management
let toastState: ToasterToast[] = []
let listeners: Array<(toasts: ToasterToast[]) => void> = []

function emitChange() {
  listeners.forEach((listener) => listener(toastState))
}

export function toast(props: Toast) {
  const id = Math.random().toString(36).slice(2)
  const dismiss = () => {
    toastState = toastState.filter((t) => t.id !== id)
    emitChange()
  }

  const newToast: ToasterToast = {
    ...props,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) dismiss()
    },
  }

  toastState = [newToast, ...toastState]
  emitChange()

  return {
    id,
    dismiss,
    update: (props: Toast) => {
      toastState = toastState.map((t) => 
        t.id === id ? { ...t, ...props } : t
      )
      emitChange()
    },
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>(toastState)

  useState(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter(listener => listener !== setToasts)
    }
  })

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      toastState = toastId 
        ? toastState.filter((t) => t.id !== toastId)
        : []
      emitChange()
    },
  }
}
