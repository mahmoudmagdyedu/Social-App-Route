import { z } from "zod";
export const passwordSchema = z
  .string()
  .min(8, "كلمة السر لازم تكون 8 حروف على الأقل")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
    "استخدم حرف كبير وصغير ورقم ورمز زي @"
  );
export const signupSchema = z
  .object({
    name: z.string().trim().min(3, "اكتب اسمك، 3 حروف على الأقل"),
    username: z
      .string()
      .min(3, "اسم المستخدم 3 حروف على الأقل")
      .regex(/^[a-zA-Z0-9_]+$/, "استخدم حروف إنجليزية وأرقام و underscore بس"),
    email: z.email("اكتب بريد إلكتروني صحيح"),
    dateOfBirth: z
      .string()
      .refine(
        (value) =>
          Boolean(value) &&
          new Date(value).getTime() < Date.now() &&
          new Date(value).getFullYear() >= 1900,
        "اختار تاريخ ميلاد صحيح قبل النهارده"
      ),
    gender: z.enum(["male", "female"]),
    password: passwordSchema,
    rePassword: z.string(),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "كلمتا السر مش متطابقتين",
    path: ["rePassword"],
  });
export const signinSchema = z.object({
  login: z.string().trim().min(1, "اكتب بريدك أو اسم المستخدم"),
  password: z.string().min(1, "اكتب كلمة السر"),
});
