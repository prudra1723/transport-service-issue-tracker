package au.com.nexustech.transporttracker.service;

import au.com.nexustech.transporttracker.dto.DashboardCountResponse;
import au.com.nexustech.transporttracker.dto.DashboardSummaryResponse;
import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import au.com.nexustech.transporttracker.repository.ServiceIssueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import au.com.nexustech.transporttracker.dto.MonthlyTrendResponse;
import java.util.ArrayList;

import java.util.Arrays;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ServiceIssueRepository serviceIssueRepository;

    public DashboardService(
            ServiceIssueRepository serviceIssueRepository
    ) {
        this.serviceIssueRepository = serviceIssueRepository;
    }

    public DashboardSummaryResponse getSummary() {
        long totalIssues =
                serviceIssueRepository.count();

        long openIssues =
                serviceIssueRepository.countByStatus(
                        IssueStatus.OPEN
                );

        long criticalIssues =
                serviceIssueRepository.countByPriority(
                        IssuePriority.CRITICAL
                );

        long resolvedIssues =
                serviceIssueRepository.countByStatus(
                        IssueStatus.RESOLVED
                );

        Double averageResolutionHours =
                serviceIssueRepository.findAverageResolutionHours();

        return new DashboardSummaryResponse(
                totalIssues,
                openIssues,
                criticalIssues,
                resolvedIssues,
                averageResolutionHours == null
                        ? 0.0
                        : averageResolutionHours
        );
    }

    public List<DashboardCountResponse> getIssuesByPriority() {
        return Arrays.stream(IssuePriority.values())
                .map(priority -> new DashboardCountResponse(
                        priority.name(),
                        serviceIssueRepository.countByPriority(priority)
                ))
                .toList();
    }

    public List<DashboardCountResponse> getIssuesByCategory() {
        return Arrays.stream(IssueCategory.values())
                .map(category -> new DashboardCountResponse(
                        category.name(),
                        serviceIssueRepository.countByCategory(category)
                ))
                .toList();
    }
    public List<MonthlyTrendResponse> getMonthlyTrend() {

    List<Object[]> results =
            serviceIssueRepository.findMonthlyTrend();

    List<MonthlyTrendResponse> response =
            new ArrayList<>();

    for (Object[] row : results) {

        response.add(
                new MonthlyTrendResponse(
                        row[0].toString(),
                        ((Number) row[1]).longValue()
                )
        );
    }

    return response;
}
}