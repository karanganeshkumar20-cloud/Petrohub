"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBox() {

  const [query, setQuery] = useState("");

  const router = useRouter();


  const handleSearch = () => {

    if (query.trim()) {

      router.push(`/search?q=${query}`);

    }

  };


  return (

    <div className="mt-10 flex w-full max-w-2xl">

      <input
        type="text"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {

          if (e.key === "Enter") {
            handleSearch();
          }

        }}
        className="
        w-full
        rounded-l-xl
        border
        border-slate-700
        bg-slate-900
        px-5
        py-4
        outline-none
        focus:border-orange-500
        "
      />


      <button

        onClick={handleSearch}

        className="
        rounded-r-xl
        bg-orange-500
        px-8
        font-semibold
        hover:bg-orange-600
        "

      >
        Search

      </button>


    </div>

  );
}