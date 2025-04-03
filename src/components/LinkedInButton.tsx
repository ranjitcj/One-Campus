// File 1: components/LinkedInButton.tsx
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function LinkedInButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">Welcome, {session.user?.name}</h2>
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full"
          />
        )}
        <p>Email: {session.user?.email}</p>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("linkedin")}
      className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded hover:bg-[#006097]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
      Sign in with LinkedIn
    </button>
  );
}
