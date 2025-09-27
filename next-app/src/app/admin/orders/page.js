"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import OrderList from '../../../components/OrderList';
import ProductAvailabilityAdmin from '../../../components/ProductAvailabilityAdmin';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-white font-sans p-6">
      <div className="mb-2 flex justify-between items-center">
        <div className="text-green-700 font-semibold text-lg">Admin connecté : {user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : ""}</div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
          onClick={logout}
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
