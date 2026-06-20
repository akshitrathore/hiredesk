export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No activity";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}
