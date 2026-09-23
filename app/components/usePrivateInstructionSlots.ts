"use client";

import { useEffect, useState } from "react";

export type PrivateInstructionSlot = {
  date: string;
  startTime: string;
  endTime: string;
};

type Audience = "adult" | "junior";

const cachedSlots = new Map<Audience, PrivateInstructionSlot[]>();
const inflight = new Map<Audience, Promise<PrivateInstructionSlot[]>>();

function isSlot(value: unknown): value is PrivateInstructionSlot {
  if (typeof value !== "object" || value === null) return false;
  const slot = value as Record<string, unknown>;
  return (
    typeof slot.date === "string" &&
    typeof slot.startTime === "string" &&
    typeof slot.endTime === "string"
  );
}

function loadSlots(type: Audience): Promise<PrivateInstructionSlot[]> {
  const cached = cachedSlots.get(type);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(type);
  if (pending) return pending;

  const request = fetch(`/api/programs/private-availability?type=${type}`)
    .then(async (response) => {
      if (!response.ok) throw new Error("Failed to load times");
      const body: unknown = await response.json();
      if (
        typeof body !== "object" ||
        body === null ||
        !Array.isArray((body as { slots?: unknown }).slots)
      ) {
        throw new Error("Failed to load times");
      }
      const slots = (body as { slots: unknown[] }).slots.filter(isSlot);
      cachedSlots.set(type, slots);
      return slots;
    })
    .finally(() => {
      inflight.delete(type);
    });

  inflight.set(type, request);
  return request;
}

/** Loads open times for the private page that is open. Kept separate from the program catalog. */
export function usePrivateInstructionSlots(type: Audience) {
  const [slots, setSlots] = useState<PrivateInstructionSlot[]>(
    () => cachedSlots.get(type) ?? [],
  );
  const [loading, setLoading] = useState(() => !cachedSlots.has(type));

  useEffect(() => {
    if (cachedSlots.has(type)) {
      setSlots(cachedSlots.get(type) ?? []);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    loadSlots(type)
      .then((nextSlots) => {
        if (!cancelled) setSlots(nextSlots);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type]);

  return { slots, loading };
}
