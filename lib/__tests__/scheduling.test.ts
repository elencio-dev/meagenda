import { describe, it, expect } from "vitest"
import { generateTimeSlots } from "@/lib/scheduling"

describe("generateTimeSlots", () => {
  it("generates hourly slots from 08:00 to 10:00", () => {
    const slots = generateTimeSlots("08:00", "10:00", 60)
    expect(slots).toEqual(["08:00", "09:00"])
  })

  it("generates 30-min slots from 08:00 to 09:30", () => {
    const slots = generateTimeSlots("08:00", "09:30", 30)
    expect(slots).toEqual(["08:00", "08:30", "09:00"])
  })

  it("returns empty array when start equals end", () => {
    expect(generateTimeSlots("10:00", "10:00", 60)).toEqual([])
  })

  it("returns empty array when start is after end", () => {
    expect(generateTimeSlots("11:00", "08:00", 60)).toEqual([])
  })

  it("pads hours and minutes with leading zeros", () => {
    const slots = generateTimeSlots("09:00", "10:00", 60)
    expect(slots[0]).toBe("09:00")
  })

  it("generates exact boundary: end is NOT included", () => {
    // 08:00 → 10:00 with 60min: should give [08:00, 09:00], NOT 10:00
    const slots = generateTimeSlots("08:00", "10:00", 60)
    expect(slots).not.toContain("10:00")
    expect(slots).toHaveLength(2)
  })

  it("works correctly with 15-minute intervals across an hour", () => {
    const slots = generateTimeSlots("08:00", "09:00", 15)
    expect(slots).toEqual(["08:00", "08:15", "08:30", "08:45"])
  })

  it("handles midnight boundary without Date() drift", () => {
    // This would break the old Date-based impl around midnight — pure math is safe
    const slots = generateTimeSlots("23:00", "24:00", 30)
    expect(slots).toEqual(["23:00", "23:30"])
  })
})
