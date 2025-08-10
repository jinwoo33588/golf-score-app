// src/components/layout/AppShell.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import './AppShell.css';

export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
