/**
 * Scheduling utilities.
 * Uses minutes-since-midnight arithmetic — no Date objects, no timezone drift.
 */

/**
 * Generates time slot strings ("HH:MM") from `start` to `end` (exclusive)
 * at `intervalMin` minute increments.
 *
 * @example
 * generateTimeSlots("08:00", "10:00", 60) // ["08:00", "09:00"]
 */
export function generateTimeSlots(
  start: string,
  end: string,
  intervalMin: number
): string[] {
  const toMinutes = (t: string): number => {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }

  const slots: string[] = []
  let cur = toMinutes(start)
  const endMin = toMinutes(end)

  while (cur < endMin) {
    const h = String(Math.floor(cur / 60)).padStart(2, "0")
    const m = String(cur % 60).padStart(2, "0")
    slots.push(`${h}:${m}`)
    cur += intervalMin
  }

  return slots
}
