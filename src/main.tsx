import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AdminPage } from './admin/AdminPage';
import { LabPage } from './lab/LabPage';
import { PickupPage } from './components/PickupPage';
import { isPickupCode } from './lib/pickup';
import './index.css';

// Tiny router: /admin, /build, /r/CODE, everything else → the booth.
const path = window.location.pathname.replace(/\/+$/, '');
const pickupCode = path.match(/^\/r\/([23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6})$/)?.[1];
const page =
  path === '/admin' ? (
    <AdminPage />
  ) : path === '/build' ? (
    <LabPage />
  ) : pickupCode && isPickupCode(pickupCode) ? (
    <PickupPage code={pickupCode} />
  ) : (
    <App />
  );

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>);
