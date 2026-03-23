import { useState, useEffect, useCallback } from "react";
import { PublisherProfile, defaultProfile } from "../schema";

const STORAGE_KEY = "kimi:publisher";

export function usePublisherProfile() {
  const [profile, setProfile] = useState<PublisherProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfile({ ...defaultProfile, ...parsed });
      }
    } catch (e) {
      console.error("Failed to load profile from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfile = useCallback((newProfile: PublisherProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
      return true;
    } catch (e) {
      console.error("Failed to save profile to localStorage", e);
      return false;
    }
  }, []);

  const clearProfile = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setProfile(defaultProfile);
      return true;
    } catch (e) {
      console.error("Failed to clear profile", e);
      return false;
    }
  }, []);

  const exportJSON = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(profile, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "publisher-profile.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export profile", e);
    }
  }, [profile]);

  return {
    profile,
    isLoaded,
    saveProfile,
    clearProfile,
    exportJSON,
  };
}
