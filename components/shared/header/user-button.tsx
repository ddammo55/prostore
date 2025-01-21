import Link from 'next/link';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignOutUser } from '@/lib/actions/user.actions';

const UserButton = async () => {
    const session = await auth();
    if (!session)
        return (
            <Link href='/api/auth/signin'>
                <Button>Sign In</Button>
            </Link>
        );
    return <div>User Button</div>
}

export default UserButton;