import Link from "next/link";

import {
  getServerSession,
} from "next-auth";

import {
  redirect,
} from "next/navigation";

import mongoose from "mongoose";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import SavedItemsManager from "@/components/profile/SavedItemsManager";

import {
  authOptions,
} from "@/lib/auth";

import {
  connectDB,
} from "@/lib/mongodb";

import User from "@/models/User";
import Article from "@/models/Article";

import {
  BookModel,
} from "@/models/Book";

import {
  BookmarkModel,
} from "@/models/Bookmark";

export const dynamic =
  "force-dynamic";

/* =========================
   PROFILE DATA
========================= */

async function getProfileData(
  email: string
) {
  await connectDB();

  const user =
    await User.findOne({
      email:
        email
          .trim()
          .toLowerCase(),
    })
      .select(
        "_id name email role image isBlocked"
      )
      .exec();

  if (!user) {
    return null;
  }

  const isBlocked =
    user.get(
      "isBlocked"
    ) === true;

  if (isBlocked) {
    return {
      blocked: true,
    };
  }

  const userId =
    user.get(
      "_id"
    ) as mongoose.Types.ObjectId;

  const bookmarks =
    await BookmarkModel.find({
      userId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

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

  const [
    articles,
    books,
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
    ]);

  const articleMap =
    new Map(
      articles.map(
        (
          article
        ) => [
          String(
            article._id
          ),
          article,
        ]
      )
    );

  const bookMap =
    new Map(
      books.map(
        (
          book
        ) => [
          String(
            book._id
          ),
          book,
        ]
      )
    );

  /*
   * Keep bookmarks in
   * saved-date order.
   */

  const savedItems =
    bookmarks
      .map(
        (
          bookmark
        ) => {
          const itemId =
            String(
              bookmark.itemId
            );

          const item =
            bookmark.itemType ===
            "article"
              ? articleMap.get(
                  itemId
                )
              : bookMap.get(
                  itemId
                );

          if (!item) {
            return null;
          }

          return {
            bookmarkId:
              String(
                bookmark._id
              ),

            itemType:
              bookmark.itemType,

            savedAt:
              bookmark.createdAt,

            item,
          };
        }
      )
      .filter(
        (
          item
        ) =>
          item !== null
      );

  return JSON.parse(
    JSON.stringify({
      blocked: false,

      user: {
        _id:
          String(
            userId
          ),

        name:
          user.get(
            "name"
          ) || "",

        email:
          user.get(
            "email"
          ) || "",

        role:
          user.get(
            "role"
          ) ||
          "user",

        image:
          user.get(
            "image"
          ) || "",
      },

      bookmarks:
        savedItems,
    })
  );
}

/* =========================
   PROFILE PAGE
========================= */

export default async function ProfilePage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (
    !session?.user?.email
  ) {
    redirect(
      "/login?callbackUrl=/profile"
    );
  }

  const data =
    await getProfileData(
      session.user.email
    );

  if (!data) {
    redirect(
      "/login"
    );
  }

  if (
    data.blocked ===
    true
  ) {
    redirect(
      "/login?error=AccountBlocked"
    );
  }

  const {
    user,
    bookmarks,
  } = data;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* =========================
          PROFILE HEADER
      ========================= */}

      <section className="border-b border-slate-800 px-6 py-12">
        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-5">

              {/* AVATAR */}

              {user.image ? (
                <img
                  src={
                    user.image
                  }
                  alt={
                    user.name
                  }
                  className="h-20 w-20 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-3xl font-bold text-orange-400">
                  {user.name
                    ?.charAt(
                      0
                    )
                    .toUpperCase() ||
                    "U"}
                </div>
              )}

              <div>
                <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                  My PetroHub
                </p>

                <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                  Welcome,{" "}
                  {
                    user.name
                  }
                </h1>

                <p className="mt-2 text-slate-400">
                  {
                    user.email
                  }
                </p>

                <div className="mt-3">
                  <span
                    className={
                      user.role ===
                      "admin"
                        ? "rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400"
                        : "rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400"
                    }
                  >
                    {
                      user.role
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* HEADER ACTIONS */}

            <div className="flex flex-wrap gap-3">
              <Link
                href="/articles"
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                Browse Articles
              </Link>

              <Link
                href="/library"
                className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                Engineering Library
              </Link>

              {user.role ===
                "admin" && (
                <Link
                  href="/admin"
                  className="rounded-xl border border-orange-500 px-5 py-3 font-bold text-orange-400 transition hover:bg-orange-500/10"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          PROFILE CONTENT
      ========================= */}

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">

          <SavedItemsManager
            initialBookmarks={
              bookmarks
            }
          />

          {/* =========================
              QUICK ACTIONS
          ========================= */}

          <section className="mt-14 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Explore PetroHub
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Quick Actions
            </h2>

            <p className="mt-3 max-w-2xl text-slate-400">
              Continue learning,
              discover engineering
              resources and manage
              your saved collection.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                href="/articles"
                className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                Browse Articles
              </Link>

              <Link
                href="/categories"
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                Categories
              </Link>

              <Link
                href="/library"
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                Library
              </Link>

              <Link
                href="/search"
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                Search PetroHub
              </Link>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}