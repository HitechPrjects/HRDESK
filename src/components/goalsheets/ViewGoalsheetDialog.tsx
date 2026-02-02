import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Goalsheet, GoalItem, TargetType } from './types';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ViewGoalsheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalsheet: Goalsheet | null;
  goalItems: GoalItem[];
  targetTypes: TargetType[];
}

export function ViewGoalsheetDialog({ 
  open, 
  onOpenChange, 
  goalsheet,
  goalItems,
  targetTypes
}: ViewGoalsheetDialogProps) {
  if (!goalsheet) return null;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = goalsheet.month ? months[goalsheet.month - 1] : format(new Date(goalsheet.period_start), 'MMMM');
  const year = goalsheet.year || format(new Date(goalsheet.period_start), 'yyyy');

  const getTargetName = (targetTypeId: string | null) => {
    if (!targetTypeId) return '-';
    const target = targetTypes.find(t => t.id === targetTypeId);
    return target?.name || '-';
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(128, 0, 128);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(`Goalsheet|${monthName} ${year}`, 105, 15, { align: 'center' });

    // Employee info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Name: ${goalsheet.profile?.first_name} ${goalsheet.profile?.last_name}`, 14, 35);
    doc.text(`Employee Number: ${goalsheet.profile?.employee_id || '-'}`, 14, 45);

    // Table data
    const tableData = goalItems.map(item => [
      getTargetName(item.target_type_id),
      item.title || '-',
      item.week1_value || '',
      item.week2_value || '',
      item.week3_value || '',
      item.week4_value || '',
      item.out_of_box || '',
      item.overall_percentage ? `${item.overall_percentage}%` : ''
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Target', 'Goals', 'Week-1', 'Week-2', 'Week-3', 'Week-4', 'Out of Box', 'Over All']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [128, 0, 128], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    });

    doc.save(`Goalsheet_${goalsheet.profile?.first_name}_${monthName}_${year}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-purple-700 text-white p-4 -m-6 mb-4 rounded-t-lg">
          <DialogTitle className="text-center text-xl">
            Goalsheet|{monthName} {year}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4 border rounded-lg p-4">
            <div className="flex gap-2">
              <span className="font-semibold">Name</span>
              <span>{goalsheet.profile?.first_name} {goalsheet.profile?.last_name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">Employee Number</span>
              <span>{goalsheet.profile?.employee_id || '-'}</span>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-700">
                  <TableHead className="text-white font-semibold">Target</TableHead>
                  <TableHead className="text-white font-semibold">Goals</TableHead>
                  <TableHead className="text-white font-semibold">Week-1</TableHead>
                  <TableHead className="text-white font-semibold">Week-2</TableHead>
                  <TableHead className="text-white font-semibold">Week-3</TableHead>
                  <TableHead className="text-white font-semibold">Week-4</TableHead>
                  <TableHead className="text-white font-semibold">Out of Box</TableHead>
                  <TableHead className="text-white font-semibold">Over All</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goalItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {getTargetName(item.target_type_id)}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {item.title}
                    </TableCell>
                    <TableCell>{item.week1_value || ''}</TableCell>
                    <TableCell>{item.week2_value || ''}</TableCell>
                    <TableCell>{item.week3_value || ''}</TableCell>
                    <TableCell>{item.week4_value || ''}</TableCell>
                    <TableCell>{item.out_of_box || ''}</TableCell>
                    <TableCell>
                      {item.overall_percentage ? `${item.overall_percentage}%` : ''}
                    </TableCell>
                  </TableRow>
                ))}
                {goalItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No goal items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={downloadPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
