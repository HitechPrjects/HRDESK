import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';

/* ================================================================
   Place the PDF file at: public/HR_Rules_and_Regulations_Document_Final.pdf
   so it is served from the root and downloadable at the href below.
   ================================================================ */
const PDF_PATH = "/HRpolicy/HR_Rules_and_Regulations_Document_Final.pdf";

interface PolicySection {
  number: number;
  title: string;
  points: string[];
}

const policySections: PolicySection[] = [
  {
    number: 1,
    title: 'Employment Policy',
    points: [
      'All employees must sign the employment agreement and adhere to the bond period as defined in their offer letter.',
      'For most technical and training roles, a 1–2 year bond will apply.',
      'Employment confirmation depends on successful completion of the training period and satisfactory background verification.',
      'Dual employment or any outside business engagement without prior written consent from management is strictly prohibited.',
    ],
  },
  {
    number: 2,
    title: 'Working Hours',
    points: [
      'Work Days: Monday to Friday',
      'Timings: 10:00 AM – 7:00 PM',
      '9 hours of work is mandatory',
      'Saturday work depends on manager confirmation every Friday',
      'Employees are expected to maintain punctuality and adhere to attendance policies. Late arrivals or early departures will be monitored and may affect salary or performance evaluations.',
    ],
  },
  {
    number: 3,
    title: 'Leave Policy',
    points: [
      'No leave is permitted during the training period except sick leave with valid documentation.',
      'After confirmation, employees are eligible for earned, casual, and medical leaves as per company norms.',
      'All leave requests must be pre-approved by the reporting manager and HR.',
      'Unauthorized absences will lead to loss of pay and may affect employment continuity.',
    ],
  },
  {
    number: 4,
    title: 'Salary and Benefits',
    points: [
      'Salaries will be credited within the first week of every month.',
      'Incentives and increments depend on individual and team performance, subject to management approval.',
      'Any deductions for unapproved leaves or policy violations will be reflected in the monthly payroll.',
    ],
  },
  {
    number: 5,
    title: 'Notice Period',
    points: [
      'During the training period, either party may terminate employment with one week\u2019s notice.',
      'For employees under a 1–2 year bond, a 3-month notice period is mandatory.',
      'For employees who have completed more than 3 years of service, the notice period will be 2 months.',
      'When an employee submits their resignation, the salary for the first month of the notice period will be placed on hold and released along with the final settlement upon completion of the notice period.',
      'Employees who fail to serve the required notice or break the bond prematurely will be liable for bond recovery or other penalties as per company policy.',
      'Upon successful completion of the bond period, employees may follow standard exit policies with management approval.',
    ],
  },
  {
    number: 6,
    title: 'Transfer Policy',
    points: [
      'Employees may be transferred between departments, client projects, or locations within Puducherry or other operational branches based on business needs.',
    ],
  },
  {
    number: 7,
    title: 'Code of Conduct',
    points: [
      'Employees must maintain professionalism, discipline, and integrity at all times.',
      'Confidential company or client data must not be shared with external parties.',
      'Harassment, misconduct, or unethical behavior will result in immediate disciplinary action.',
    ],
  },
  {
    number: 8,
    title: 'Background Verification',
    points: [
      'HTGE may conduct background checks before or after joining to verify education, address, and employment history.',
      'Misrepresentation of any information may result in offer withdrawal or termination.',
    ],
  },
  {
    number: 9,
    title: 'Cooling Period Policy',
    points: [
      'Employees who exit HTGE will observe a 6-month cooling period within the TIDEL campus.',
      'During this period, they are not eligible to join any other company operating within the same premises.',
    ],
  },
  {
    number: 10,
    title: 'Dress Code',
    points: [
      'Monday to Thursday: Full formal attire is mandatory.',
      'Friday and Saturday: Official casual wear is permitted.',
      'Employees are expected to maintain a neat and professional appearance at all times.',
    ],
  },
  {
    number: 11,
    title: 'Use of Company Assets',
    points: [
      'All IT systems, credentials, and devices must be used solely for official purposes.',
      'Employees must ensure the return of company assets before final settlement.',
    ],
  },
  {
    number: 12,
    title: 'Disciplinary Action',
    points: [
      'Any violation of company rules, insubordination, or unethical behavior will invite disciplinary action—ranging from warnings to termination.',
    ],
  },
  {
    number: 13,
    title: 'Confidentiality and Non-Disclosure',
    points: [
      'All employees must sign a Non-Disclosure Agreement (NDA) at the time of joining.',
      'Confidential company or client information must not be disclosed under any circumstances.',
    ],
  },
  {
    number: 14,
    title: 'Termination of Employment',
    points: [
      'The company reserves the right to terminate employment due to poor performance, violation of policy, or breach of bond agreement.',
      'Employees must return all company property and complete the clearance process before final settlement.',
    ],
  },
  {
    number: 15,
    title: 'Amendments',
    points: [
      'The management of HTGE Technologies Pvt. Ltd. reserves the right to modify, update, or add to these policies at any time, with prior notice to employees.',
    ],
  },
];

export default function HRPolicy() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">HR Rules and Regulations</h1>
          <p className="text-muted-foreground">HTGE Technologies Pvt. Ltd. — Official policy document</p>
        </div>

        <a href={PDF_PATH} download>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </a>
      </div>

      <Card>
        <CardContent className="p-6 md:p-10">
          <div className="flex items-center gap-3 border-b pb-4 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">HR Rules and Regulations Document</h2>
              <p className="text-sm text-muted-foreground">
                This document outlines the official policies, rules, and regulations of HTGE
                Technologies Pvt. Ltd. It applies to all employees, interns, and trainees,
                ensuring transparency, discipline, and mutual respect within the organization.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {policySections.map((section) => (
              <section key={section.number} id={`section-${section.number}`}>
                <h3 className="text-lg font-bold mb-2">
                  {section.number}. {section.title}
                </h3>
                <ul className="list-disc pl-6 space-y-1.5 text-sm leading-relaxed">
                  {section.points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground space-y-1">
            <p>Tidel Neo, XQW8+PWV, Thiruchitrambalam-Koot Road, Koot Road, Tamil Nadu 605111</p>
            <p>Contact: +91 7092909192 / +91 7200117161</p>
            <p>
              <a href="https://www.htge.org" target="_blank" rel="noopener noreferrer" className="underline">
                www.htge.org
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}