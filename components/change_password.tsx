import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function ChangePasswordForm({
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
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder=""
          autoComplete="email"
          required
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          New Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
          type="password"
          placeholder="*******"
          autoComplete="password"
          required
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password2"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Confirm Password
        </Label>

        <Input
          id="password2"
          name="password2"
          className="bg-muted text-md md:text-sm"
          type="password"
          placeholder="******"
          autoComplete="password2"
          required
          autoFocus
        />
      </div>

      {children}
    </Form>
  );
}