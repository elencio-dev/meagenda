import * as z from "zod";

export const publicBookingSchema = z.object({
  clienteId: z.number().int().positive("Cliente ID é obrigatório"),
  servicoId: z.number().int().positive("Serviço é obrigatório"),
  profissionalId: z.number().int().positive("Profissional ID inválido").nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário inválido"),
  notes: z.string().optional().nullable(),
  slug: z.string().min(1, "Slug da empresa obrigatório").optional()
});

export const updateBookingSchema = z.object({
  id: z.number().int().positive("ID é obrigatório"),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário inválido").optional(),
});

export const configSchema = z.object({
  name: z.string().min(2, "Atenção: O nome do negócio precisa ter pelo menos 2 caracteres").optional(),
  slug: z.string().min(2, "O link deve ter no mínimo 2 caracteres").optional(),
  image: z.string().url("A URL da imagem é inválida").optional().nullable().or(z.literal("")),
  description: z.string().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable().or(z.literal("")),
  remindersEnabled: z.boolean().optional(),
  operatingHours: z.any().optional(), // Can refine later if needed
});

export const serviceSchema = z.object({
  name: z.string().min(2, "O nome do serviço precisa ter pelo menos 2 caracteres"),
  duration: z.number().int().positive("A duração deve ser um número positivo"),
  price: z.number().nonnegative("O preço não pode ser negativo").optional().default(0),
  category: z.string().optional().nullable(),
  popular: z.boolean().optional(),
  imageUrl: z.string().url("A URL da imagem é inválida").optional().nullable().or(z.literal("")),
});
