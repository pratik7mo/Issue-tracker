export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type IssueType = 
  | 'HARDWARE_VALIDATION' 
  | 'FIRMWARE_BUG' 
  | 'SYSTEM_INTEGRATION' 
  | 'PRODUCTION_YIELD' 
  | 'PERFORMANCE_OPTIMIZATION'
  | 'BUG' | 'TASK' | 'PROBLEM' | 'DEFECT' | 'CRITICAL' | 'IMPROVEMENT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  issueType: IssueType;
  createdBy: string;
  assignedTo: string;
  assignedToUserId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueRequestDto {
  title: string;
  description: string;
  priority: Priority;
  issueType: IssueType;
  status: Status;
  assignedToUserId?: number;
}

export interface DashboardStats {
  totalIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  highPriorityIssues: number;
  typeDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export interface UserLeaderboard {
  id: number;
  name: string;
  email: string;
  resolvedCount: number;
}
