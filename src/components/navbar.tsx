import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  HomeIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();

  return (
    <nav className="fixed h-screen w-12 sm:w-32">
      <ul className="flex h-screen flex-col items-center gap-3 py-6 sm:items-start">
        <NavItem text="Home" href="/" Icon={HomeIcon} />
        <NavItem
          text="Profile"
          href={
            session ? `/profile/${session.profile.username}` : "/auth/signin"
          }
          Icon={UserIcon}
        />
        {session ? (
          <>
            <div className="mt-auto">
              <NavItem text="Post" href="/post" Icon={PencilSquareIcon} />
            </div>
            <NavItem
              text="Log out"
              href="/"
              Icon={ArrowRightOnRectangleIcon}
              onClick={() => void signOut()}
            />
          </>
        ) : (
          <div className="mt-auto">
            <NavItem
              text="Log in"
              href="/auth/signin"
              Icon={ArrowLeftOnRectangleIcon}
            />
          </div>
        )}
      </ul>
    </nav>
  );
};

type Icon = typeof HomeIcon;

const NavItem: React.FC<{
  text: string;
  href: Parameters<typeof Link>[0]["href"];
  Icon: Icon;
  onClick?: () => void;
}> = ({ text, href, Icon, onClick }) => {
  return (
    <li className="rounded-full border-[1px] border-gray-600 bg-slate-800 p-1 sm:w-28 sm:px-2">
      <Link href={href} className="flex items-center gap-1.5" onClick={onClick}>
        <Icon className="w-7" />
        <h3 className="hidden h-max sm:block">{text}</h3>
      </Link>
    </li>
  );
};
