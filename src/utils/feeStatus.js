export function isValidDate(value) {
  if (!value) return false
  const d = new Date(value)
  return !Number.isNaN(d.getTime())
}

export function isPaidForCurrentCycle(student) {
  const rawPayment = student?.fee_submission_date || student?.last_payment
  if (!isValidDate(rawPayment)) return false

  const paymentDate = new Date(rawPayment)
  const refDate = new Date()

  // Paid only if payment month/year matches current month/year
  return (
    paymentDate.getUTCFullYear() === refDate.getUTCFullYear() &&
    paymentDate.getUTCMonth() === refDate.getUTCMonth()
  )
}

export function getDueDate(student) {
  const raw = student?.fee_due_date || student?.next_due
  if (!isValidDate(raw)) return null
  return new Date(raw)
}
