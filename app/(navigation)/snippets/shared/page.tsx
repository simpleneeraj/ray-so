import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { nanoid } from "nanoid";
import { Snippet } from "../snippets";
import { Shared } from "./shared";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

function parseURLSnippet(queryString?: string | string[]): Snippet[] {
  if (!queryString) {
    return [];
  }
  let snippets;
  if (Array.isArray(queryString)) {
    snippets = queryString;
  } else {
    snippets = [queryString];
  }
  return snippets.map((snippet) => ({
    ...JSON.parse(snippet),
    id: nanoid(),
    isShared: true,
  }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const snippets = parseURLSnippet(searchParams.snippet as string);
  if (!snippets) {
    notFound();
  }

  if (snippets.length === 1) {
    const snippet = snippets[0];
    const pageTitle = `${snippet.name} - Raycast Snippet`;
    const pageDescription = snippet.text;

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        images: [
          {
            url: `/snippets/og?title=${encodeURIComponent(snippet.name)}&description=${encodeURIComponent(
              pageDescription
            )}`,
          },
        ],
      },
      other: {
        "twitter:label1": "Keyword",
        "twitter:data": snippet.keyword,
        "twitter:label2": "App",
        "twitter:data2": "Raycast",
      },
    };
  } else {
    const pageTitle = `Raycast Snippets`;
    const pageDescription = `${snippets.length} snippets shared with you`;
    const ogImageDescription = `"${snippets[0].name}" and ${snippets.length - 1} more ${
      snippets.length === 2 ? "snippet" : "snippets"
    }`;

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        images: [
          {
            url: `/snippets/og?title=${encodeURIComponent(pageTitle)}&description=${encodeURIComponent(
              ogImageDescription
            )}`,
          },
        ],
      },
    };
  }
}

export default async function Page({ params, searchParams }: Props) {
  const snippets = parseURLSnippet(searchParams.snippet as string);

  if (!snippets) {
    notFound();
  }
  return <Shared snippets={snippets} />;
}
