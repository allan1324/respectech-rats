export type ClassInfo = {
  name: string;
  slug:
    | "software-programming"
    | "data-analytics"
    | "cybersecurity"
    | "artificial-intelligence"
    | "ui-ux"
    | "digital-marketing";
};

export const CLASSES: ClassInfo[] = [
  { name: "Software Programming", slug: "software-programming" },
  { name: "Data Analytics", slug: "data-analytics" },
  { name: "Cybersecurity", slug: "cybersecurity" },
  { name: "Artificial Intelligence", slug: "artificial-intelligence" },
  { name: "UI/UX", slug: "ui-ux" },
  { name: "Digital Marketing", slug: "digital-marketing" },
];

export function getClassBySlug(slug: string): ClassInfo | undefined {
  return CLASSES.find((c) => c.slug === slug);
}
