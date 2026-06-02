"use client";

import { NewsFeed } from "@/components/news/news-feed";
import { PageHeader } from "@/components/shared/page-header";
import { useTranslation } from "@/hooks/use-translation";
import { MOCK_DAILY_NEWS, type NewsCategory } from "@/lib/mock/news";

const DAILY_CATEGORIES: NewsCategory[] = [
  "Tech",
  "Business",
  "World",
  "Politics",
  "Science",
  "Sports",
];

export default function DailyNewsPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t("toolsUI.news.daily.title")}
        description={t("toolsUI.news.daily.description")}
      />
      <NewsFeed items={MOCK_DAILY_NEWS} categories={DAILY_CATEGORIES} />
    </>
  );
}
