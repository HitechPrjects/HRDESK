import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone } from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  publishedAt: string;
}

interface AnnouncementsCardProps {
  announcements: Announcement[];
}

export function AnnouncementsCard({ announcements }: AnnouncementsCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Announcements</CardTitle>
        <Megaphone className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements</p>
        ) : (
          <div className="space-y-4">
            {announcements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{announcement.title}</p>
                  <Badge variant={getPriorityColor(announcement.priority) as any}>
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {announcement.content}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(announcement.publishedAt), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}