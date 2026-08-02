package au.com.nexustech.transporttracker.dto;

public record MonthlyTrendResponse(
        String month,
        long count
) {
}