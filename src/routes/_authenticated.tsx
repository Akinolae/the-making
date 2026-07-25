import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { getStoredUser } from '../lib/auth';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: () => {
    if (!getStoredUser()) {
      throw redirect({ to: '/auth' });
    }
  },
});

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-blush">
      <Outlet />
    </div>
  );
}
