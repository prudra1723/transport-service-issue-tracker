package au.com.nexustech.transporttracker.dto;

public record DashboardSummaryResponse(
        long totalIssues,
        long openIssues,
        long criticalIssues,
        long resolvedIssues,
        double averageResolutionHours
) {
}