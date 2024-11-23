'use server';

import { z } from 'zod';

import { createUser, getUser, createVerification, verifyOTP, verifyUser } from '@/lib/db/queries';

import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verifyFormSchema = z.object({
  email: z.string().email(),
});

const otpFormSchema = z.object({
  otp: z.string(),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    await createUser(validatedData.email, validatedData.password);
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface ForgetPasswordActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_does_not_exist'
    | 'invalid_data';
}

export const forgetPassword = async (
  _: ForgetPasswordActionState,
  formData: FormData,
): Promise<ForgetPasswordActionState> => {
  console.log("running");
  console.log(formData.get('email'));
  
  try {
    const validatedData = verifyFormSchema.parse({
      email: formData.get('email'),
    });
    const [user] = await getUser(validatedData.email);
    console.log(validatedData);
    
    if (!user) {
      console.log({ status: 'user_does_not_exist' });
      
      return { status: 'user_does_not_exist' } as ForgetPasswordActionState;
    }
    console.log(user);
    
    const otp = await createVerification({id:user.id, email:user.email})
    console.log(otp);
    return { status: 'success' };
  } catch (error) {
    console.log(error);
    
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
}


export interface OTPPasswordActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'not_valid'
    | 'invalid_data';
  data?:  {
    otp: string;
    id: string;
    createdAt: Date;
    userId: string;
},
role?:"password_change"|"user_verify"
}
export const verifyOtp = async (
  _: OTPPasswordActionState,
  formData: FormData,
): Promise<OTPPasswordActionState> => {
  
  try {
    const validatedData = otpFormSchema.parse({
      otp: formData.get('otp'),
    });
    const {data, error}= await verifyOTP({otp:validatedData.otp})
    
    if (error) {
      return { status: 'not_valid' } as OTPPasswordActionState;
    }
    
    if(_.role ==="user_verify"){
      await verifyUser({id:data?.userId!})
    }
    return { status: 'success', data:  data};
  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
}


export interface ChangePasswordActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'not_valid'
    | 'invalid_data';
  data?:  {
    otp: string;
    id: string;
    createdAt: Date;
    userId: string;
},
}
export const changePassword = async (
  _: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> => {
  
  try {
    const validatedData = otpFormSchema.parse({
      otp: formData.get('otp'),
    });
    const {data, error}= await verifyOTP({otp:validatedData.otp})
    
    if (error) {
      return { status: 'not_valid' } as OTPPasswordActionState;
    }
    
    return { status: 'success', data:  data};
  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
}