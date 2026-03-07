"use client"
import { createContext } from "react";
import type { MessagesContextType, CurrentMessageContextType } from "../types/types";

export const MessagesContext = createContext<MessagesContextType | null>(null);
export const CurrentMessageContext = createContext<CurrentMessageContextType | null>(null);