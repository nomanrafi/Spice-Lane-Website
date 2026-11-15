import { z } from 'zod';

export const TIME_SLOTS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

export const reservationSchema = z.object({
  date: z.string().min(1, 'Pick a date').refine((d) => new Date(d + 'T23:59') >= new Date(), 'Date must be today or later'),
  time: z.string().refine((t) => TIME_SLOTS.includes(t), 'Pick a time slot'),
  party: z.coerce.number().int().min(1, 'At least 1 guest').max(12, 'Max 12 guests online — call us for larger groups'),
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email'),
});
export type Reservation = z.infer<typeof reservationSchema>;
