"use client";

import { useEffect, useRef } from "react";
import { supabase } from "../supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type ChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface RealtimeOptions {
  table: string;
  event?: ChangeEvent;
  filter?: string;
  onData: (payload: Record<string, unknown>) => void;
}

export function useRealtime({ table, event = "*", filter, onData }: RealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    const channelName = `${table}-${event}-${filter ?? "all"}-${Date.now()}`;
    const config: Record<string, unknown> = {
      event,
      schema: "public",
      table,
    };
    if (filter) config.filter = filter;

    channelRef.current = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as Parameters<RealtimeChannel["on"]>[0],
        config as Parameters<RealtimeChannel["on"]>[1],
        (payload: Record<string, unknown>) => onDataRef.current(payload)
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, event, filter]);
}
