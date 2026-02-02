import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cake } from 'lucide-react';

interface BirthdayPerson {
  id: string;
  name: string;
  department?: string;
  date: string;
}

interface BirthdayCardProps {
  birthdays: BirthdayPerson[];
}

export function BirthdayCard({ birthdays }: BirthdayCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Birthdays</CardTitle>
        <Cake className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {birthdays.length === 0 ? (
          <p className="text-sm text-muted-foreground">No birthdays today</p>
        ) : (
          <div className="space-y-2">
            {birthdays.map((person) => (
              <div key={person.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Cake className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{person.name}</p>
                  {person.department && (
                    <p className="text-xs text-muted-foreground">{person.department}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}