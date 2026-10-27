import SearchClient from "./SearchClient";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    category?: string | string[];
    contentType?: string | string[];
  }>;
};

function firstValue(
  value?: string | string[]
) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return "";
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params =
    await searchParams;

  return (
    <SearchClient
      initialQuery={firstValue(
        params.q
      )}
      initialType={firstValue(
        params.type
      )}
      initialCategory={firstValue(
        params.category
      )}
      initialContentType={firstValue(
        params.contentType
      )}
    />
  );
}