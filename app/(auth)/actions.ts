"use server";

import { z } from "zod";

import {
  createUser,
  getUser,

  updatePassword,

} from "@/lib/db/queries";

import { signIn } from "./auth";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verifyFormSchema = z.object({
  email: z.string().email(),
});

const otpFormSchema = z.object({
  email: z.string(),
  password: z.string(),
  password2: z.string(),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
}

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: "user_exists" } as RegisterActionState;
    }
    const created = await createUser(validatedData.email, validatedData.password);
    await signIn("credentials", {
      id:created[0].id,
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export interface ChangePasswordActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "not_valid"
    | "invalid_data";
}

// Verify and Change Password
export const ChangePassword = async (
  _: ChangePasswordActionState,
  formData: FormData
): Promise<ChangePasswordActionState> => {
  try {
    const validatedData = otpFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      password2: formData.get("password2"),
    });
    if (validatedData.password !== validatedData.password2) {
      return { status: "not_valid" };
    }

    await updatePassword({
      email:validatedData.email,
      password: validatedData.password,
    });

    return { status: "success", };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};