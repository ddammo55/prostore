import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { APP_NAME } from '@/lib/constants';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SignUpForm from './signup-form';
 
export const metadata: Metadata = {
    title: 'Sign Up',
  };


  const SignUp = async (props: {
    searchParams: Promise<{
      callbackUrl: string;
    }>;
  }) => {
    const searchParams = await props.searchParams;
   
    const { callbackUrl } = searchParams;
   
    const session = await auth();
   
    if (session) {
      return redirect(callbackUrl || '/');
    }

    return (
        <div className='w-full max-w-md mx-auto'>
          <Card>
            <CardHeader className='space-y-4'>
              <Link href='/' className='flex-center'>
                <Image
                  priority={true}
                  src='/images/logo.svg'
                  width={100}
                  height={100}
                  alt={`${APP_NAME} logo`}
                />
              </Link>
              <CardTitle className='text-center'>계정 만들기</CardTitle>
              <CardDescription className='text-center'>
              계정을 만들려면 아래에 정보를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>  
                <SignUpForm /> 
            </CardContent>
          </Card>
        </div>
      );
    };
     
    export default SignUp;