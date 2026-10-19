import { redirect } from 'next/navigation';

export default function VanzatorLoginRedirect() {
  redirect('/admin/login');
}
