import { Suspense } from 'react';
import WorkItemsPageClient from './work-items-page-client';

export default function WorkItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          加载中...
        </div>
      }
    >
      <WorkItemsPageClient />
    </Suspense>
  );
}
