import type { User } from "@/lib/types";

export const MOCK_USERS: User[] = [
  {
    id: "u_admin",
    name: "Avery Quinn",
    email: "avery@avortyx.io",
    role: "admin",
    organization: "Avortyx Demo Co.",
  },
  {
    id: "u_buyer",
    name: "Morgan Reed",
    email: "morgan@buyersco.com",
    role: "buyer",
    organization: "BuyersCo",
  },
  {
    id: "u_pub",
    name: "Riley Chen",
    email: "riley@traffichub.com",
    role: "publisher",
    organization: "TrafficHub",
  },
];
