'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInDefaultValues } from '@/lib/constants'; // 로그인 기본값 가져오기
import Link from 'next/link';


import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signInWithCredentials } from '@/lib/actions/user.actions';

import { useSearchParams } from 'next/navigation';


const CredentialsSigninForm = () => {
    const [data, action] = useActionState(signInWithCredentials, {
        message: '',
        success: false,
      });

      const searchParams = useSearchParams();
      const callbackUrl = searchParams.get('callbackUrl') || '/';

      const SignInButton = () => {
        const { pending } = useFormStatus();
        return (
          <Button disabled={pending} className='w-full' variant='default'>
            {pending ? 'Signing In...' : 'Sign In with credentials'}
          </Button>
        );
      };

    return (
        <form action={action}>
            <input type='hidden' name='callbackUrl' value={callbackUrl} />
            <div className="space-y-6">
                <div>
                    <Label htmlFor='email'>Email</Label>
                    <Input 
                        id='email'
                        name='email'
                        required
                        type='email'
                        defaultValue={signInDefaultValues.email}
                        placeholder='email'
                    />
                </div>
                <div>
                    <Label htmlFor='password'>Password</Label>
                    <Input 
                        id='password'
                        name='password'
                        required
                        type='password'
                        defaultValue={signInDefaultValues.password}
                        placeholder='password'
                    />
                </div>

                <div>
                    <SignInButton />
                </div>

                {data && !data.success && (
                    <div className='text-center text-destructive'>
                        {data.message}
                    </div>
                )}


                <div className="text-sm text-center text-muted-foreground">
                 계정이 없나요? {' '}
                    <Link target='_self' className='link' href='/sign-up'>
                        Sign Up
                    </Link>   
                </div>
            </div>
        </form>
    )
}

export default CredentialsSigninForm;