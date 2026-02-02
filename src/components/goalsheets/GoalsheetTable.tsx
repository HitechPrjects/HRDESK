import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Pencil, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Goalsheet } from './types';
import { useAuth } from '@/contexts/AuthContext';

interface GoalsheetTableProps {
  goalsheets: Goalsheet[];
  onView: (goalsheet: Goalsheet) => void;
  onEdit: (goalsheet: Goalsheet) => void;
  onDelete: (id: string) => void;
  onEnterPercentage?: (goalsheet: Goalsheet) => void;
  showWeekButtons?: boolean;
  onWeekClick?: (goalsheet: Goalsheet, week: number) => void;
}

export function GoalsheetTable({ 
  goalsheets, 
  onView, 
  onEdit, 
  onDelete,
  onEnterPercentage,
  showWeekButtons = false,
  onWeekClick
}: GoalsheetTableProps) {
  const { authUser } = useAuth();
  const [search, setSearch] = useState('');
  const isAdmin = authUser?.role === 'admin';
  const isHR = authUser?.role === 'hr';

  const filteredGoalsheets = goalsheets.filter(g =>
    `${g.profile?.first_name} ${g.profile?.last_name} ${g.profile?.employee_id} ${g.title}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getWeekButtonVariant = (goalsheet: Goalsheet, week: number) => {
    const items = goalsheet.goal_items || [];
    const weekKey = `week${week}_submitted` as keyof typeof items[0];
    const allSubmitted = items.length > 0 && items.every(item => item[weekKey]);
    return allSubmitted ? 'default' : 'outline';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Emp.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Reporting Manager</TableHead>
              <TableHead>Created Date</TableHead>
              {!showWeekButtons && <TableHead>Percentage</TableHead>}
              <TableHead>View</TableHead>
                {showWeekButtons && (
                  <>
                    <TableHead>Week 1</TableHead>
                    <TableHead>Week 2</TableHead>
                    <TableHead>Week 3</TableHead>
                    <TableHead>Week 4</TableHead>
                    <TableHead>Out of Box</TableHead>
                    <TableHead>Overall</TableHead>
                  </>
                )}
              {(isAdmin || isHR) && !showWeekButtons && <TableHead>Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGoalsheets.map((goalsheet) => (
              <TableRow key={goalsheet.id}>
                <TableCell className="font-medium">
                  {goalsheet.profile?.employee_id || '-'}
                </TableCell>
                <TableCell>
                  {goalsheet.profile?.first_name} {goalsheet.profile?.last_name}
                </TableCell>
                <TableCell>
                  {goalsheet.reporting_manager 
                    ? `${goalsheet.reporting_manager.first_name} ${goalsheet.reporting_manager.last_name}`
                    : '-'}
                </TableCell>
                <TableCell>
                  {format(new Date(goalsheet.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                {!showWeekButtons && (
                  <TableCell>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {goalsheet.overall_progress}%
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(goalsheet)}
                    className="bg-orange-500 hover:bg-orange-600 text-white h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
                {showWeekButtons && onWeekClick && (
                  <>
                    <TableCell>
                      <Button
                        variant={getWeekButtonVariant(goalsheet, 1)}
                        size="sm"
                        onClick={() => onWeekClick(goalsheet, 1)}
                        className={getWeekButtonVariant(goalsheet, 1) === 'default' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white border-0'}
                      >
                        Week 1
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={getWeekButtonVariant(goalsheet, 2)}
                        size="sm"
                        onClick={() => onWeekClick(goalsheet, 2)}
                        className={getWeekButtonVariant(goalsheet, 2) === 'default' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white border-0'}
                      >
                        Week 2
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={getWeekButtonVariant(goalsheet, 3)}
                        size="sm"
                        onClick={() => onWeekClick(goalsheet, 3)}
                        className={getWeekButtonVariant(goalsheet, 3) === 'default' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white border-0'}
                      >
                        Week 3
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={getWeekButtonVariant(goalsheet, 4)}
                        size="sm"
                        onClick={() => onWeekClick(goalsheet, 4)}
                        className={getWeekButtonVariant(goalsheet, 4) === 'default' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white border-0'}
                      >
                        Week 4
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {goalsheet.goal_items?.some(item => item.out_of_box) 
                          ? goalsheet.goal_items.filter(item => item.out_of_box).map(item => item.out_of_box).join(', ')
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(goalsheet)}
                        className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                      >
                        Overall
                      </Button>
                    </TableCell>
                  </>
                )}
                {(isAdmin || isHR) && !showWeekButtons && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(goalsheet)}
                        className="bg-blue-500 hover:bg-blue-600 text-white h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="bg-red-500 hover:bg-red-600 text-white h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Goalsheet?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this goalsheet and all its items.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(goalsheet.id)} 
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {onEnterPercentage && (
                        <Button
                          size="sm"
                          onClick={() => onEnterPercentage(goalsheet)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
                        >
                          Enter Percentage
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filteredGoalsheets.length === 0 && (
              <TableRow>
                <TableCell colSpan={showWeekButtons ? 12 : 7} className="text-center text-muted-foreground">
                  No goalsheets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
