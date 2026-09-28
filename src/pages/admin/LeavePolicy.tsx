import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText } from 'lucide-react';

const PDF_PATH = '/policy/Leave-Policy.pdf';

const leaveTableData = [
  { quarter: 'Q1', period: 'January – March', planned: '2 Days', sick: '3 Days' },
  { quarter: 'Q2', period: 'April – June', planned: '2 Days', sick: '3 Days' },
  { quarter: 'Q3', period: 'July – September', planned: '2 Days', sick: '3 Days' },
  { quarter: 'Q4', period: 'October – December', planned: '2 Days', sick: '3 Days' },
  { quarter: 'Annual Total', period: 'January – December', planned: '8 Days', sick: '12 Days' },
];

export default function LeavePolicy() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave & Allowance Policy</h1>
          <p className="text-muted-foreground">HTGE Technologies Pvt. Ltd.</p>
        </div>

        <a href={PDF_PATH} download>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </a>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3 border-b pb-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">1. Purpose</h2>
              <p className="text-sm text-muted-foreground">
                The purpose of this policy is to define the company&apos;s leave entitlement,
                leave salary credit provisions, and allowance structure for employees involved in
                lead ownership, training, and internship activities.
              </p>
            </div>
          </div>

          <section className="space-y-5">
            <div>
              <h3 className="mb-4 text-2xl font-bold">Part A – Leave Policy</h3>
              <h4 className="mb-3 text-xl font-bold">2. Leave Structure</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                The annual leave entitlement is divided into four quarters:
              </p>

              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Quarter</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Planned Leave</TableHead>
                      <TableHead>Sick Leave</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveTableData.map((row) => (
                      <TableRow key={row.quarter}>
                        <TableCell className="font-medium">{row.quarter}</TableCell>
                        <TableCell>{row.period}</TableCell>
                        <TableCell>{row.planned}</TableCell>
                        <TableCell>{row.sick}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xl font-bold">3. Planned Leave</h4>
              <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                <li>Employees are entitled to 2 planned leave days per quarter.</li>
                <li>Planned leave should be requested and approved in advance wherever possible.</li>
                <li>The planned leave entitlement is applicable within the respective quarter.</li>
                <li>
                  If the planned leave is not utilized, the eligible unused leave will be credited to
                  the employee&apos;s salary based on the employee&apos;s Basic Salary.
                </li>
                <li>
                  The salary credit will be calculated based on the number of eligible unused leave
                  days.
                </li>
              </ol>
            </div>

            <div>
              <h4 className="mb-3 text-xl font-bold">4. Sick Leave</h4>
              <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                <li>Employees are entitled to 1 sick leave day every month.</li>
                <li>The total annual sick leave entitlement is 12 days.</li>
                <li>Sick leave may be utilized when an employee is unwell and unable to attend work.</li>
                <li>Employees should inform their reporting manager or management as soon as reasonably possible when taking sick leave.</li>
                <li>If applicable under the company&apos;s rules, supporting medical documentation may be requested.</li>
              </ol>
            </div>

            <div>
              <h4 className="mb-3 text-xl font-bold">5. Unused Leave and Salary Credit</h4>
              <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                <li>Eligible unused leave will be credited to the employee&apos;s salary based on the employee&apos;s Basic Salary.</li>
                <li>The salary credit will be calculated according to the number of eligible unused leave days.</li>
                <li>Leave that has already been utilized will not qualify for salary credit.</li>
                <li>The applicable salary credit will be processed according to the company&apos;s payroll cycle.</li>
              </ol>
            </div>

            <div>
              <h3 className="mb-4 text-2xl font-bold">Part B – Allowance / Incentive Policy</h3>
              <h4 className="mb-3 text-xl font-bold">6. Two-Payment Structure</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Where the payment is received in two stages, the allowance will be distributed as follows:
              </p>

              <div className="mb-4 overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Stage</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Allowance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>1st Payment</TableCell>
                      <TableCell>Lead Owner</TableCell>
                      <TableCell>5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2nd Payment</TableCell>
                      <TableCell>Trainer</TableCell>
                      <TableCell>2.5%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <p className="mb-2 text-sm font-medium">The 2.5% Trainer allowance applies to:</p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground">
                <li>Batch Training</li>
                <li>One-to-One Training</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-xl font-bold">7. Single-Payment Structure</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Where the payment is received as a single payment, the allowance will be distributed as follows:
              </p>

              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Allowance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Lead Owner</TableCell>
                      <TableCell>2.5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Trainer</TableCell>
                      <TableCell>2.5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Total Allowance</TableCell>
                      <TableCell className="font-semibold">5%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xl font-bold">8. Internship Allowance</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                For internship-related payments, the allowance will be distributed as follows:
              </p>

              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Allowance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Lead Owner</TableCell>
                      <TableCell>2.5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Trainer</TableCell>
                      <TableCell>2.5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Total Allowance</TableCell>
                      <TableCell className="font-semibold">5%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xl font-bold">9. Allowance Summary</h4>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Type</TableHead>
                      <TableHead>Lead Owner</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>1st Payment</TableCell>
                      <TableCell>5%</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2nd Payment</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>2.5%</TableCell>
                      <TableCell>2.5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Single Payment</TableCell>
                      <TableCell>2.5%</TableCell>
                      <TableCell>2.5%</TableCell>
                      <TableCell>5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Internship</TableCell>
                      <TableCell>2.5%</TableCell>
                      <TableCell>2.5%</TableCell>
                      <TableCell>5%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xl font-bold">10. General Guidelines</h4>
              <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                <li>Allowances will be calculated based on the applicable payment/revenue amount.</li>
                <li>The applicable percentage will depend on the payment structure and the employee&apos;s assigned role.</li>
                <li>The Lead Owner and Trainer responsibilities should be clearly assigned before the applicable allowance is processed.</li>
                <li>Allowances will be processed according to the company&apos;s applicable payroll/payment schedule.</li>
                <li>Any changes to the allowance structure must be approved by management.</li>
                <li>The company reserves the right to review and amend this policy based on business and operational requirements.</li>
              </ol>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
