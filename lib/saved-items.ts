import mongoose from "mongoose";

import Article from "@/models/Article";

import {
  BookModel,
} from "@/models/Book";

import FormulaModel from "@/models/Formula";

import {
  BookmarkModel,
  type BookmarkItemType,
} from "@/models/Bookmark";

/* =========================================================
   TYPES
========================================================= */

export type SavedContentItem = {
  _id: string;

  title: string;
  slug: string;

  description?: string;

  category?: string;
  subDomain?: string;

  author?: string;

  featuredImage?: string;
  coverImage?: string;

  contentType?: string;

  formulaText?: string;
};

export type SavedBookmarkItem = {
  bookmarkId:
    string;

  itemType:
    BookmarkItemType;

  savedAt?:
    string;

  item:
    SavedContentItem;
};

type BookmarkRow = {
  _id:
    string;

  itemType:
    BookmarkItemType;

  itemId:
    string;

  createdAt?:
    string;
};

type ArticleRow = {
  _id:
    string;

  title:
    string;

  slug:
    string;

  summary?:
    string;

  category?:
    string;

  featuredImage?:
    string;

  author?:
    string;
};

type BookRow = {
  _id:
    string;

  title:
    string;

  slug:
    string;

  description?:
    string;

  category?:
    string;

  coverImage?:
    string;

  author?:
    string;

  contentType?:
    string;
};

type FormulaRow = {
  _id:
    string;

  name:
    string;

  slug:
    string;

  description?:
    string;

  domain?:
    string;

  subDomain?:
    string;

  formulaText?:
    string;
};

/* =========================================================
   ALLOWED TYPES
========================================================= */

export const BOOKMARK_ITEM_TYPES:
  BookmarkItemType[] = [
    "article",
    "book",
    "formula",
  ];

export function isBookmarkItemType(
  value: string
): value is BookmarkItemType {
  return BOOKMARK_ITEM_TYPES.includes(
    value as BookmarkItemType
  );
}

/* =========================================================
   VERIFY TARGET
========================================================= */

export async function bookmarkTargetExists(
  itemType:
    BookmarkItemType,

  itemId:
    mongoose.Types.ObjectId
) {
  if (
    itemType ===
    "article"
  ) {
    return Boolean(
      await Article.exists({
        _id:
          itemId,

        status:
          "Published",
      })
    );
  }

  if (
    itemType ===
    "book"
  ) {
    return Boolean(
      await BookModel.exists({
        _id:
          itemId,

        status:
          "Published",
      })
    );
  }

  return Boolean(
    await FormulaModel.exists({
      _id:
        itemId,

      status:
        "Published",

      verificationStatus:
        "verified",
    })
  );
}

/* =========================================================
   LOAD SAVED ITEMS
========================================================= */

export async function loadSavedItems(
  userId:
    mongoose.Types.ObjectId
): Promise<
  SavedBookmarkItem[]
> {
  const bookmarkDocuments =
    await BookmarkModel.find({
      userId,
    })
      .sort({
        createdAt:
          -1,
      })
      .lean();

  const bookmarks =
    JSON.parse(
      JSON.stringify(
        bookmarkDocuments
      )
    ) as BookmarkRow[];

  const articleIds =
    bookmarks
      .filter(
        (
          bookmark
        ) =>
          bookmark.itemType ===
          "article"
      )
      .map(
        (
          bookmark
        ) =>
          bookmark.itemId
      );

  const bookIds =
    bookmarks
      .filter(
        (
          bookmark
        ) =>
          bookmark.itemType ===
          "book"
      )
      .map(
        (
          bookmark
        ) =>
          bookmark.itemId
      );

  const formulaIds =
    bookmarks
      .filter(
        (
          bookmark
        ) =>
          bookmark.itemType ===
          "formula"
      )
      .map(
        (
          bookmark
        ) =>
          bookmark.itemId
      );

  const [
    articleDocuments,
    bookDocuments,
    formulaDocuments,
  ] =
    await Promise.all([
      Article.find({
        _id: {
          $in:
            articleIds,
        },

        status:
          "Published",
      })
        .select(
          "_id title slug summary category featuredImage author"
        )
        .lean(),

      BookModel.find({
        _id: {
          $in:
            bookIds,
        },

        status:
          "Published",
      })
        .select(
          "_id title slug description category coverImage author contentType"
        )
        .lean(),

      FormulaModel.find({
        _id: {
          $in:
            formulaIds,
        },

        status:
          "Published",

        verificationStatus:
          "verified",
      })
        .select(
          "_id name slug description domain subDomain formulaText"
        )
        .lean(),
    ]);

  const articles =
    JSON.parse(
      JSON.stringify(
        articleDocuments
      )
    ) as ArticleRow[];

  const books =
    JSON.parse(
      JSON.stringify(
        bookDocuments
      )
    ) as BookRow[];

  const formulas =
    JSON.parse(
      JSON.stringify(
        formulaDocuments
      )
    ) as FormulaRow[];

  const articleMap =
    new Map<
      string,
      SavedContentItem
    >();

  for (
    const article of
    articles
  ) {
    articleMap.set(
      String(
        article._id
      ),
      {
        _id:
          String(
            article._id
          ),

        title:
          article.title,

        slug:
          article.slug,

        description:
          article.summary ||
          "",

        category:
          article.category ||
          "",

        featuredImage:
          article.featuredImage ||
          "",

        author:
          article.author ||
          "",
      }
    );
  }

  const bookMap =
    new Map<
      string,
      SavedContentItem
    >();

  for (
    const book of
    books
  ) {
    bookMap.set(
      String(
        book._id
      ),
      {
        _id:
          String(
            book._id
          ),

        title:
          book.title,

        slug:
          book.slug,

        description:
          book.description ||
          "",

        category:
          book.category ||
          "",

        coverImage:
          book.coverImage ||
          "",

        author:
          book.author ||
          "",

        contentType:
          book.contentType ||
          "book",
      }
    );
  }

  const formulaMap =
    new Map<
      string,
      SavedContentItem
    >();

  for (
    const formula of
    formulas
  ) {
    formulaMap.set(
      String(
        formula._id
      ),
      {
        _id:
          String(
            formula._id
          ),

        title:
          formula.name,

        slug:
          formula.slug,

        description:
          formula.description ||
          "",

        category:
          formula.domain ||
          "Engineering",

        subDomain:
          formula.subDomain ||
          "",

        formulaText:
          formula.formulaText ||
          "",
      }
    );
  }

  const items:
    SavedBookmarkItem[] = [];

  for (
    const bookmark of
    bookmarks
  ) {
    let item:
      SavedContentItem |
      undefined;

    if (
      bookmark.itemType ===
      "article"
    ) {
      item =
        articleMap.get(
          String(
            bookmark.itemId
          )
        );
    } else if (
      bookmark.itemType ===
      "book"
    ) {
      item =
        bookMap.get(
          String(
            bookmark.itemId
          )
        );
    } else {
      item =
        formulaMap.get(
          String(
            bookmark.itemId
          )
        );
    }

    /*
     * If content was unpublished,
     * rejected or deleted, do not
     * expose the stale bookmark.
     */
    if (!item) {
      continue;
    }

    items.push({
      bookmarkId:
        String(
          bookmark._id
        ),

      itemType:
        bookmark.itemType,

      savedAt:
        bookmark.createdAt,

      item,
    });
  }

  return items;
}