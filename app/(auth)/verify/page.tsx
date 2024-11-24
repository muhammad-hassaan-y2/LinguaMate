'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SubmitButton } from '@/components/submit-button';

import { verifyOtp, type OTPPasswordActionState } from '../actions';
import { VerifyOTPForm } from '@/components/verify-otp-form';

export default function Page() {
    const router = useRouter();
  
    const [isSuccessful, setIsSuccessful] = useState(false);
  
    const [state, formAction] = useActionState<OTPPasswordActionState, FormData>(
      verifyOtp,
      {
        status: 'idle',
        role:"user_verify"
      },
    );
  
    useEffect(() => {
      if (state.status === 'failed') {
        toast.error('Invalid credentials!');
      } else if (state.status === 'invalid_data') {
        toast.error('Failed validating your submission!');
      } else if (state.status ===  "not_valid") {
          toast.error('OTP not Valid or Expired');
      } else if (state.status === 'success') {
        setIsSuccessful(true);
        router.push("/login");
      }
      console.log(state.status);
      
    }, [state.status, router]);
  
    const handleSubmit = (formData: FormData) => {
      formAction(formData);
    };
  
    return (
      <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
        <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="text-xl font-semibold dark:text-zinc-50">Verify OTP</h3>
            {/* <p className="text-sm text-gray-500 dark:text-zinc-400">
              Provide email linked to your account
            </p> */}
          </div>
          <VerifyOTPForm action={handleSubmit} >
            <SubmitButton isSuccessful={isSuccessful}>Verify OTP</SubmitButton>
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              {"Don't have an account? "}
              <Link
                href="/register"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Sign up
              </Link>
              {' for free.'}
            </p>
          </VerifyOTPForm>
        </div>
      </div>
    );
  }
  