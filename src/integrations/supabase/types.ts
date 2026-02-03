export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          published_at: string | null
          target_roles: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          published_at?: string | null
          target_roles?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          published_at?: string | null
          target_roles?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string
          check_in_ip: string | null
          check_in_time: string | null
          check_out_ip: string | null
          check_out_time: string | null
          created_at: string
          id: string
          notes: string | null
          profile_id: string
          status: string | null
          timesheet_completed: boolean | null
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          attendance_date?: string
          check_in_ip?: string | null
          check_in_time?: string | null
          check_out_ip?: string | null
          check_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          profile_id: string
          status?: string | null
          timesheet_completed?: boolean | null
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          check_in_ip?: string | null
          check_in_time?: string | null
          check_out_ip?: string | null
          check_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          profile_id?: string
          status?: string | null
          timesheet_completed?: boolean | null
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_departments_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_departments_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      designations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          level: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          level?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          level?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_designations_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_designations_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_items: {
        Row: {
          achieved_value: string | null
          created_at: string
          description: string | null
          goalsheet_id: string
          id: string
          out_of_box: string | null
          overall_percentage: number | null
          overall_value: string | null
          progress: number | null
          status: Database["public"]["Enums"]["goal_status"] | null
          target_type_id: string | null
          target_value: string | null
          title: string
          updated_at: string
          week1_submitted: boolean | null
          week1_value: string | null
          week2_submitted: boolean | null
          week2_value: string | null
          week3_submitted: boolean | null
          week3_value: string | null
          week4_submitted: boolean | null
          week4_value: string | null
          weight: number | null
        }
        Insert: {
          achieved_value?: string | null
          created_at?: string
          description?: string | null
          goalsheet_id: string
          id?: string
          out_of_box?: string | null
          overall_percentage?: number | null
          overall_value?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_type_id?: string | null
          target_value?: string | null
          title: string
          updated_at?: string
          week1_submitted?: boolean | null
          week1_value?: string | null
          week2_submitted?: boolean | null
          week2_value?: string | null
          week3_submitted?: boolean | null
          week3_value?: string | null
          week4_submitted?: boolean | null
          week4_value?: string | null
          weight?: number | null
        }
        Update: {
          achieved_value?: string | null
          created_at?: string
          description?: string | null
          goalsheet_id?: string
          id?: string
          out_of_box?: string | null
          overall_percentage?: number | null
          overall_value?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_type_id?: string | null
          target_value?: string | null
          title?: string
          updated_at?: string
          week1_submitted?: boolean | null
          week1_value?: string | null
          week2_submitted?: boolean | null
          week2_value?: string | null
          week3_submitted?: boolean | null
          week3_value?: string | null
          week4_submitted?: boolean | null
          week4_value?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_items_goalsheet_id_fkey"
            columns: ["goalsheet_id"]
            isOneToOne: false
            referencedRelation: "goalsheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_items_target_type_id_fkey"
            columns: ["target_type_id"]
            isOneToOne: false
            referencedRelation: "target_types"
            referencedColumns: ["id"]
          },
        ]
      }
      goalsheets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          month: number | null
          overall_progress: number | null
          period_end: string
          period_start: string
          profile_id: string
          reporting_manager_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["goal_status"] | null
          title: string
          updated_at: string
          week: number | null
          year: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          month?: number | null
          overall_progress?: number | null
          period_end: string
          period_start: string
          profile_id: string
          reporting_manager_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          title: string
          updated_at?: string
          week?: number | null
          year?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          month?: number | null
          overall_progress?: number | null
          period_end?: string
          period_start?: string
          profile_id?: string
          reporting_manager_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          title?: string
          updated_at?: string
          week?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goalsheets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalsheets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalsheets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalsheets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalsheets_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalsheets_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalsheets_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalsheets_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          created_at: string
          id: string
          leave_type_id: string
          profile_id: string
          remaining_days: number | null
          total_days: number | null
          updated_at: string
          used_days: number | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          leave_type_id: string
          profile_id: string
          remaining_days?: number | null
          total_days?: number | null
          updated_at?: string
          used_days?: number | null
          year?: number
        }
        Update: {
          created_at?: string
          id?: string
          leave_type_id?: string
          profile_id?: string
          remaining_days?: number | null
          total_days?: number | null
          updated_at?: string
          used_days?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          created_at: string
          default_days: number | null
          description: string | null
          id: string
          is_paid: boolean | null
          name: string
          requires_approval: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_days?: number | null
          description?: string | null
          id?: string
          is_paid?: boolean | null
          name: string
          requires_approval?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_days?: number | null
          description?: string | null
          id?: string
          is_paid?: boolean | null
          name?: string
          requires_approval?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      leaves: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          leave_type_id: string
          profile_id: string
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"] | null
          total_days: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          leave_type_id: string
          profile_id: string
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          total_days: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          leave_type_id?: string
          profile_id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          total_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          basic_salary: number | null
          bonus: number | null
          conveyance_allowance: number | null
          created_at: string
          created_by: string | null
          da: number | null
          esi: number | null
          gross_earnings: number | null
          hra: number | null
          id: string
          loan_deduction: number | null
          medical_allowance: number | null
          month: number
          net_salary: number | null
          other_deductions: number | null
          other_earnings: number | null
          payment_date: string | null
          payment_status: string | null
          pf: number | null
          professional_tax: number | null
          profile_id: string
          special_allowance: number | null
          tds: number | null
          total_deductions: number | null
          updated_at: string
          year: number
        }
        Insert: {
          basic_salary?: number | null
          bonus?: number | null
          conveyance_allowance?: number | null
          created_at?: string
          created_by?: string | null
          da?: number | null
          esi?: number | null
          gross_earnings?: number | null
          hra?: number | null
          id?: string
          loan_deduction?: number | null
          medical_allowance?: number | null
          month: number
          net_salary?: number | null
          other_deductions?: number | null
          other_earnings?: number | null
          payment_date?: string | null
          payment_status?: string | null
          pf?: number | null
          professional_tax?: number | null
          profile_id: string
          special_allowance?: number | null
          tds?: number | null
          total_deductions?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          basic_salary?: number | null
          bonus?: number | null
          conveyance_allowance?: number | null
          created_at?: string
          created_by?: string | null
          da?: number | null
          esi?: number | null
          gross_earnings?: number | null
          hra?: number | null
          id?: string
          loan_deduction?: number | null
          medical_allowance?: number | null
          month?: number
          net_salary?: number | null
          other_deductions?: number | null
          other_earnings?: number | null
          payment_date?: string | null
          payment_status?: string | null
          pf?: number | null
          professional_tax?: number | null
          profile_id?: string
          special_allowance?: number | null
          tds?: number | null
          total_deductions?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          created_at: string
          generated_at: string | null
          id: string
          payroll_id: string
          payslip_number: string | null
          pdf_url: string | null
          profile_id: string
        }
        Insert: {
          created_at?: string
          generated_at?: string | null
          id?: string
          payroll_id: string
          payslip_number?: string | null
          pdf_url?: string | null
          profile_id: string
        }
        Update: {
          created_at?: string
          generated_at?: string | null
          id?: string
          payroll_id?: string
          payslip_number?: string | null
          pdf_url?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payslips_payroll_id_fkey"
            columns: ["payroll_id"]
            isOneToOne: false
            referencedRelation: "payroll"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aadhar_number: string | null
          address: string | null
          avatar_url: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string | null
          designation_id: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string | null
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name: string
          gender: string | null
          id: string
          joining_date: string | null
          last_name: string
          pan_number: string | null
          password_hash: string | null
          phone: string | null
          pincode: string | null
          reporting_manager: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aadhar_number?: string | null
          address?: string | null
          avatar_url?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name: string
          gender?: string | null
          id?: string
          joining_date?: string | null
          last_name: string
          pan_number?: string | null
          password_hash?: string | null
          phone?: string | null
          pincode?: string | null
          reporting_manager?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aadhar_number?: string | null
          address?: string | null
          avatar_url?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name?: string
          gender?: string | null
          id?: string
          joining_date?: string | null
          last_name?: string
          pan_number?: string | null
          password_hash?: string | null
          phone?: string | null
          pincode?: string | null
          reporting_manager?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
        ]
      }
      target_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          progress: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_entries: {
        Row: {
          created_at: string
          description: string | null
          entry_number: number
          from_time: string | null
          hours: number | null
          id: string
          timesheet_id: string
          to_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entry_number: number
          from_time?: string | null
          hours?: number | null
          id?: string
          timesheet_id: string
          to_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entry_number?: number
          from_time?: string | null
          hours?: number | null
          id?: string
          timesheet_id?: string
          to_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_timesheet_id_fkey"
            columns: ["timesheet_id"]
            isOneToOne: false
            referencedRelation: "timesheets"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          profile_id: string
          status: string | null
          submitted_at: string | null
          timesheet_date: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          profile_id: string
          status?: string | null
          submitted_at?: string | null
          timesheet_date?: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          status?: string | null
          submitted_at?: string | null
          timesheet_date?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      training: {
        Row: {
          certificate_url: string | null
          created_at: string
          created_by: string | null
          domain: string | null
          duration_hours: number | null
          end_date: string | null
          id: string
          outcome: string | null
          profile_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["training_status"] | null
          title: string
          trainer_name: string | null
          trainer_organization: string | null
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string
          created_by?: string | null
          domain?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          outcome?: string | null
          profile_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          title: string
          trainer_name?: string | null
          trainer_organization?: string | null
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          created_at?: string
          created_by?: string | null
          domain?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          outcome?: string | null
          profile_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          title?: string
          trainer_name?: string | null
          trainer_organization?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          profile_id: string
          session_token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          profile_id: string
          session_token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          profile_id?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          aadhar_number: string | null
          address: string | null
          avatar_url: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          department_id: string | null
          designation_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string | null
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name: string | null
          gender: string | null
          id: string | null
          joining_date: string | null
          last_name: string | null
          pan_number: string | null
          phone: string | null
          pincode: string | null
          reporting_manager: string | null
          state: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          aadhar_number?: string | null
          address?: string | null
          avatar_url?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name?: string | null
          gender?: string | null
          id?: string | null
          joining_date?: string | null
          last_name?: string | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          reporting_manager?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          aadhar_number?: string | null
          address?: string | null
          avatar_url?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name?: string | null
          gender?: string | null
          id?: string | null
          joining_date?: string | null
          last_name?: string | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          reporting_manager?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      decrypt_sensitive_data: {
        Args: { encrypted_data: string }
        Returns: string
      }
      encrypt_sensitive_data: { Args: { data: string }; Returns: string }
      get_profile_id_for_user: { Args: { _user_id: string }; Returns: string }
      has_access_to_goalsheet: {
        Args: { _goalsheet_id: string }
        Returns: boolean
      }
      has_access_to_timesheet: {
        Args: { _timesheet_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_password: { Args: { password: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_hr: { Args: never; Returns: boolean }
      is_hr: { Args: never; Returns: boolean }
      is_own_profile: { Args: { _profile_id: string }; Returns: boolean }
      mask_sensitive_value: {
        Args: { value: string; visible_chars?: number }
        Returns: string
      }
      verify_password: {
        Args: { password: string; password_hash: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hr" | "employee"
      employment_status: "active" | "fired" | "resigned" | "on_leave"
      goal_status: "not_started" | "in_progress" | "completed" | "on_hold"
      leave_status: "pending" | "approved" | "rejected" | "cancelled"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      training_status: "scheduled" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "hr", "employee"],
      employment_status: ["active", "fired", "resigned", "on_leave"],
      goal_status: ["not_started", "in_progress", "completed", "on_hold"],
      leave_status: ["pending", "approved", "rejected", "cancelled"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      training_status: ["scheduled", "in_progress", "completed", "cancelled"],
    },
  },
} as const
