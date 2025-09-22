"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import OrderList from '../../../components/OrderList';
import ProductAvailabilityAdmin from '../../../components/ProductAvailabilityAdmin';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [adminName, setAdminName] = React.useState("");
  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/');
    } else {
      setAdminName(user.name || "");
    }
  }, [router]);
  return (
    <div className="min-h-screen bg-white font-sans p-6">
      <div className="mb-2 flex justify-between items-center">
        <div className="text-green-700 font-semibold text-lg">Admin connecté : {adminName ? adminName.charAt(0).toUpperCase() + adminName.slice(1) : ""}</div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
          onClick={() => {
            localStorage.removeItem('currentUser');
            router.push('/auth/login');
          }}
        >
          Se déconnecter
        </button>
      </div>
  <h1 className="text-2xl font-bold mb-6 text-green-800">Gestion des commandes</h1>
  <ProductAvailabilityAdmin />
  <OrderList />
    </div>
  );
}
