package au.com.nexustech.transporttracker.controller;

import au.com.nexustech.transporttracker.dto.DashboardCountResponse;
import au.com.nexustech.transporttracker.dto.DashboardSummaryResponse;
import au.com.nexustech.transporttracker.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import au.com.nexustech.transporttracker.dto.MonthlyTrendResponse;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary() {
        return dashboardService.getSummary();
    }
    @GetMapping("/monthly-trend")
public List<MonthlyTrendResponse> getMonthlyTrend() {

    return dashboardService.getMonthlyTrend();
}

    @GetMapping("/by-priority")
    public List<DashboardCountResponse> getIssuesByPriority() {
        return dashboardService.getIssuesByPriority();
    }

    @GetMapping("/by-category")
    public List<DashboardCountResponse> getIssuesByCategory() {
        return dashboardService.getIssuesByCategory();
    }
}