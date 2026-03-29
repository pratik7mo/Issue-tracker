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

export interface Activity {
  issueId: number;
  action: string;
  time: string;
  icon: string;
}

export interface MyAssignedStats {
  totalAssigned: number;
  openCount: number;
  inProgressCount: number;
  overdueCount: number;
}

export interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  highPriorityIssues: number;
  overdueIssues: number;
  criticalIssues: number;
  unassignedIssues: number;
  typeDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  myAssignedIssues: MyAssignedStats;
  recentActivity: Activity[];
  recentlyCreatedIssues: Issue[];
}

export interface UserLeaderboard {
  id: number;
  name: string;
  email: string;
  resolvedCount: number;
}

