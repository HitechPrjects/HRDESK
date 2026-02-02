export interface TargetType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface GoalItem {
  id: string;
  goalsheet_id: string;
  target_type_id: string | null;
  target_type?: TargetType;
  title: string;
  description: string | null;
  target_value: string | null;
  week1_value: string | null;
  week2_value: string | null;
  week3_value: string | null;
  week4_value: string | null;
  week1_submitted: boolean;
  week2_submitted: boolean;
  week3_submitted: boolean;
  week4_submitted: boolean;
  overall_value: string | null;
  overall_percentage: number;
  progress: number;
  status: string;
  out_of_box: string | null;
}

export interface Goalsheet {
  id: string;
  profile_id: string;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string | null;
  };
  reporting_manager_id: string | null;
  reporting_manager?: {
    first_name: string;
    last_name: string;
  } | null;
  title: string;
  period_start: string;
  period_end: string;
  month: number | null;
  year: number | null;
  week: number | null;
  status: string;
  overall_progress: number;
  created_at: string;
  goal_items?: GoalItem[];
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string | null;
  email: string;
}
