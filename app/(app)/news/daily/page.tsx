import { NewsFeed } from "@/components/news/news-feed";
import { PageHeader } from "@/components/shared/page-header";
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
  return (
    <>
      <PageHeader
        title="Daily News"
        description="A live snapshot of what's happening across business, tech, politics, and the world."
      />
      <NewsFeed items={MOCK_DAILY_NEWS} categories={DAILY_CATEGORIES} />
    </>
  );
}
