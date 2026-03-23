import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save, Download, Trash2, Globe, Music, User, Mail, FileText, Share2, Building2 } from "lucide-react";

import { usePublisherProfile } from "../hooks/use-profile";
import { publisherProfileSchema, type PublisherProfile } from "../schema";
import { Input, Textarea } from "../components/Input";
import { ProfilePreview } from "../components/ProfilePreview";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { profile, isLoaded, saveProfile, clearProfile, exportJSON } = usePublisherProfile();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PublisherProfile>({
    resolver: zodResolver(publisherProfileSchema),
    defaultValues: profile,
  });

  // Reset form when profile loads from localStorage
  useEffect(() => {
    if (isLoaded) {
      reset(profile);
    }
  }, [isLoaded, profile, reset]);

  const onSubmit = (data: PublisherProfile) => {
    const success = saveProfile(data);
    if (success) {
      toast({
        title: "Profile Saved",
        description: "Your publisher profile has been saved to local storage.",
        className: "bg-card border-primary/20 text-foreground",
      });
      reset(data); // reset form state to not be dirty
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all profile data? This cannot be undone.")) {
      clearProfile();
      toast({
        title: "Profile Cleared",
        description: "All local data has been removed.",
        variant: "destructive",
      });
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center text-primary animate-pulse">Loading Tyāga System...</div>;

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pt-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50 drop-shadow-sm mb-3">
          Music Publisher Profile
        </h1>
        <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs font-medium">
          The Trappist System • Tyāga Ecosystem
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
        
        {/* Left Column: Preview & Actions */}
        <div className="space-y-8 lg:sticky lg:top-8">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-border"></span>
              Live Preview
            </h3>
            <ProfilePreview profile={profile} />
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">System Actions</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubmit(onSubmit)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Save className="w-5 h-5" />
                {isDirty ? "Save Changes" : "Profile Saved"}
              </button>
              
              <button
                type="button"
                onClick={exportJSON}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-all duration-200"
              >
                <Download className="w-5 h-5 text-primary" />
                Export Profile JSON
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 mt-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Local Data
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-border/40 bg-card/40 p-1 backdrop-blur-md shadow-xl shadow-black/20"
        >
          <div className="bg-background/80 rounded-xl p-6 sm:p-8 border border-white/5">
            <h2 className="text-2xl font-display text-foreground mb-8 pb-4 border-b border-border/50">Edit Profile Parameters</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Section 1: Identity */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold tracking-wider text-primary uppercase flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Primary Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input 
                    label="Publisher Name" 
                    placeholder="e.g. Christopher Canyon"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                  <Input 
                    label="Contact Email" 
                    type="email"
                    placeholder="contact@tyaga.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>
                <Textarea 
                  label="Biography & Vision" 
                  placeholder="Tell the story of your creative ecosystem..."
                  error={errors.bio?.message}
                  {...register("bio")}
                />
              </div>

              {/* Section 2: Industry Details */}
              <div className="space-y-5 pt-6 border-t border-border/50">
                <h3 className="text-sm font-semibold tracking-wider text-primary uppercase flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Industry Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input 
                    label="Label / Studio Name" 
                    placeholder="e.g. Tyāga"
                    error={errors.labelName?.message}
                    {...register("labelName")}
                  />
                  <Input 
                    label="PRO Affiliation" 
                    placeholder="ASCAP, BMI, SESAC..."
                    error={errors.proAffiliation?.message}
                    {...register("proAffiliation")}
                  />
                  <Input 
                    label="Catalog Size (Tracks)" 
                    type="number"
                    min="0"
                    icon={<Music className="w-4 h-4" />}
                    error={errors.catalogSize?.message}
                    {...register("catalogSize")}
                  />
                  <Input 
                    label="Website URL" 
                    type="url"
                    placeholder="https://..."
                    icon={<Globe className="w-4 h-4" />}
                    error={errors.websiteUrl?.message}
                    {...register("websiteUrl")}
                  />
                </div>
              </div>

              {/* Section 3: Digital Presence */}
              <div className="space-y-5 pt-6 border-t border-border/50">
                <h3 className="text-sm font-semibold tracking-wider text-primary uppercase flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Digital Presence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input 
                    label="Instagram Handle" 
                    placeholder="@username"
                    error={errors.socials?.instagram?.message}
                    {...register("socials.instagram")}
                  />
                  <Input 
                    label="Twitter / X Handle" 
                    placeholder="@username"
                    error={errors.socials?.twitter?.message}
                    {...register("socials.twitter")}
                  />
                  <Input 
                    label="SoundCloud URL" 
                    placeholder="https://soundcloud.com/..."
                    error={errors.socials?.soundcloud?.message}
                    {...register("socials.soundcloud")}
                  />
                  <Input 
                    label="YouTube Channel" 
                    placeholder="https://youtube.com/..."
                    error={errors.socials?.youtube?.message}
                    {...register("socials.youtube")}
                  />
                </div>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
