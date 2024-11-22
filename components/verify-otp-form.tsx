import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function VerifyOTPForm({
  action,
  children,
  
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;

}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="otp"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          OTP
        </Label>

        <Input
          id="otp"
          name="otp"
          className="bg-muted text-md md:text-sm"
          type="text"
          placeholder="XXXXXX"
          autoComplete="otp"
          required
          autoFocus
        />
      </div>

      {children}
    </Form>
  );
}
