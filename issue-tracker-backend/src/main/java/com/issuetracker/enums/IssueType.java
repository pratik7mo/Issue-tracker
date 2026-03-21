package com.issuetracker.enums;

public enum IssueType {
    HARDWARE_VALIDATION,
    FIRMWARE_BUG,
    SYSTEM_INTEGRATION,
    PRODUCTION_YIELD,
    PERFORMANCE_OPTIMIZATION,
    
    // Deprecated old values to prevent crash on existing data
    BUG, TASK, PROBLEM, DEFECT, CRITICAL, IMPROVEMENT
}
