"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { fetchCart } from "./cartSlice";
import { loadUser } from "./authSlice";

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Attempt to load the user profile to re-hydrate the auth state
    store.dispatch(loadUser() as any)
      .unwrap()
      .then(() => {
        // If logged in initially, fetch the backend cart immediately
        store.dispatch(fetchCart() as any);
      })
      .catch(() => {
        // Not strictly an error. Expected for unauthenticated users.
      });
  }, []);

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppInitializer>
        {children}
      </AppInitializer>
    </Provider>
  );
}
