import type { MetadataRoute } from "next";
import { articles } from "@/data/articles";


export default function sitemap(): MetadataRoute.Sitemap {

  const articleUrls = articles.map((article) => ({

    url: `https://petrohub.com/articles/${article.slug}`,

    lastModified: new Date(),

  }));


  return [

    {
      url: "https://petrohub.com",
      lastModified: new Date(),
    },


    {
      url: "https://petrohub.com/articles",
      lastModified: new Date(),
    },


    {
      url: "https://petrohub.com/categories/oil-gas",
      lastModified: new Date(),
    },


    {
      url: "https://petrohub.com/categories/hse",
      lastModified: new Date(),
    },


    {
      url: "https://petrohub.com/categories/mechanical",
      lastModified: new Date(),
    },


    {
      url: "https://petrohub.com/categories/electrical",
      lastModified: new Date(),
    },


    {
      url: "https://petrohub.com/categories/instrumentation",
      lastModified: new Date(),
    },


    {
      url: "https://petrohub.com/categories/process",
      lastModified: new Date(),
    },


    {
      url: "https://petrohub.com/categories/geology",
      lastModified: new Date(),
    },


    ...articleUrls,

  ];

}