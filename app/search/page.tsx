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

  let query = "";

  if (typeof params.q === "string") {
    query = params.q;
  } else if (Array.isArray(params.q)) {
    query = params.q[0] || "";
  }

  return (
    <SearchClient
      initialQuery={query}
    />
  );
}