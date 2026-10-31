import { z } from 'zod';

// Indian mobile number regex: matches with or without +91, 91, or leading 0, followed by 10 digits starting with 6-9
const indianMobileRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;

export const alumniRegistrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full Name must be at least 2 characters long')
    .max(100, 'Full Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(120, 'Email address is too long'),
  mobile: z
    .string()
    .trim()
    .regex(indianMobileRegex, 'Please enter a valid 10-digit Indian mobile number'),
  currentCity: z
    .string()
    .trim()
    .max(100, 'City name is too long')
    .optional()
    .or(z.literal('')),
  graduationYear: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z
      .number({ invalid_type_error: 'Graduation Year must be a valid number' })
      .int()
      .min(2000, 'Year must be 2000 or later')
      .max(2027, 'Year cannot be beyond 2027')
  ),
  course: z
    .string()
    .trim()
    .min(1, 'Course / Degree is required')
    .max(100, 'Course name is too long'),
  branch: z
    .string()
    .trim()
    .min(1, 'Branch / Department is required')
    .max(100, 'Branch name is too long'),
  companyName: z
    .string()
    .trim()
    .min(1, 'Current Company / Organization is required')
    .max(150, 'Company name is too long'),
  designation: z
    .string()
    .trim()
    .min(1, 'Current Designation / Job Role is required')
    .max(150, 'Designation is too long'),
});

export const updateAlumniSchema = alumniRegistrationSchema.partial();

export type AlumniRegistrationInput = z.infer<typeof alumniRegistrationSchema>;
export type UpdateAlumniInput = z.infer<typeof updateAlumniSchema>;
