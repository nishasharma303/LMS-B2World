"use client";

import { create } from "zustand";

const getStoredItem = (key) => {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const useAuthStore = create((set) => ({
  token: getStoredToken(),
  user: getStoredItem("user"),
  institute: getStoredItem("institute"),

  setAuth: ({ token, user, institute = null }) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }

      if (institute) {
        localStorage.setItem("institute", JSON.stringify(institute));
      } else {
        localStorage.removeItem("institute");
      }
    }

    set({
      token: token || null,
      user: user || null,
      institute: institute || null,
    });
  },

  setInstitute: (institute) => {
    if (typeof window !== "undefined") {
      if (institute) {
        localStorage.setItem("institute", JSON.stringify(institute));
      } else {
        localStorage.removeItem("institute");
      }
    }

    set({ institute: institute || null });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updatedFields } : null;

      if (typeof window !== "undefined") {
        if (updatedUser) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          localStorage.removeItem("user");
        }
      }

      return { user: updatedUser };
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("institute");
    }

    set({
      token: null,
      user: null,
      institute: null,
    });
  },
}));

export default useAuthStore;