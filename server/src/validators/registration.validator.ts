import { z } from 'zod';
import {
  OTHER_OPTION,
  isValidDegree,
  isValidDegreeCoursePair,
} from '../config/academicStructure.js';

// Indian mobile number regex: matches with or without +91, 91, or leading 0, followed by 10 digits starting with 6-9
const indianMobileRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;

// XSS Sanitizer: strips HTML tag characters
const sanitizeHtml = (val: string): string => val.replace(/[<>]/g, '').trim();

export const baseAlumniRegistrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full Name must be at least 2 characters long')
    .max(100, 'Full Name cannot exceed 100 characters')
    .transform(sanitizeHtml),
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
    .transform(sanitizeHtml)
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
  degree: z
    .string()
    .trim()
    .min(1, 'Degree is required')
    .max(100, 'Degree name is too long')
    .transform(sanitizeHtml),
  course: z
    .string()
    .trim()
    .min(1, 'Course is required')
    .max(100, 'Course name is too long')
    .transform(sanitizeHtml),
  otherDegree: z
    .string()
    .trim()
    .max(100, 'Custom degree name is too long')
    .transform(sanitizeHtml)
    .optional()
    .or(z.literal('')),
  otherCourse: z
    .string()
    .trim()
    .max(100, 'Custom course name is too long')
    .transform(sanitizeHtml)
    .optional()
    .or(z.literal('')),
  branch: z
    .string()
    .trim()
    .max(100, 'Branch name is too long')
    .transform(sanitizeHtml)
    .optional()
    .or(z.literal('')),
  companyName: z
    .string()
    .trim()
    .min(1, 'Current Company / Organization is required')
    .max(150, 'Company name is too long')
    .transform(sanitizeHtml),
  designation: z
    .string()
    .trim()
    .min(1, 'Current Designation / Job Role is required')
    .max(150, 'Designation is too long')
    .transform(sanitizeHtml),
});

export const alumniRegistrationSchema = baseAlumniRegistrationSchema.superRefine((data, ctx) => {
  // 1. Validate degree existence
  if (!isValidDegree(data.degree)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid degree selected: ${data.degree}`,
      path: ['degree'],
    });
  }

  // 2. Validate degree-course compatibility
  if (data.degree && data.course && !isValidDegreeCoursePair(data.degree, data.course)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Course "${data.course}" is not offered under degree "${data.degree}". Please select a valid course.`,
      path: ['course'],
    });
  }

  // 3. If degree is 'Other / Not Listed', otherDegree is required
  if (data.degree === OTHER_OPTION) {
    if (!data.otherDegree || !data.otherDegree.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify your degree name',
        path: ['otherDegree'],
      });
    }
  }

  // 4. If course is 'Other / Not Listed', otherCourse is required
  if (data.course === OTHER_OPTION) {
    if (!data.otherCourse || !data.otherCourse.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify your course / specialization name',
        path: ['otherCourse'],
      });
    }
  }
});

export const updateAlumniSchema = baseAlumniRegistrationSchema.partial();

export type AlumniRegistrationInput = z.infer<typeof alumniRegistrationSchema>;
export type UpdateAlumniInput = z.infer<typeof updateAlumniSchema>;
