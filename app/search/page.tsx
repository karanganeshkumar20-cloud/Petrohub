import SearchClient from "./SearchClient";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const rawQuery = params.q;

  const initialQuery =
    typeof rawQuery === "string"
      ? rawQuery
      : Array.isArray(rawQuery)
      ? rawQuery[0] || ""
      : "";

  return (
    <SearchClient
      initialQuery={initialQuery}
    />
  );
}