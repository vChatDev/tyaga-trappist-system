import { z } from "zod";

export const publisherProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  bio: z.string(),
  labelName: z.string().min(1, "Label name is required"),
  proAffiliation: z.string(),
  catalogSize: z.coerce.number().min(0).default(0),
  websiteUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  socials: z.object({
    instagram: z.string(),
    twitter: z.string(),
    soundcloud: z.string(),
    youtube: z.string(),
  }),
});

export type PublisherProfile = z.infer<typeof publisherProfileSchema>;

export const defaultProfile: PublisherProfile = {
  name: "",
  email: "",
  bio: "",
  labelName: "Tyāga",
  proAffiliation: "ASCAP",
  catalogSize: 0,
  websiteUrl: "",
  socials: {
    instagram: "",
    twitter: "",
    soundcloud: "",
    youtube: "",
  },
};
