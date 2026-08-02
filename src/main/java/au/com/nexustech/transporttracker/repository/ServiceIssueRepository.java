package au.com.nexustech.transporttracker.repository;

import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceIssueRepository
        extends JpaRepository<ServiceIssue, Long>,
        JpaSpecificationExecutor<ServiceIssue> {

    Optional<ServiceIssue> findByIssueNumber(
            String issueNumber
    );

    boolean existsByIssueNumber(
            String issueNumber
    );

    List<ServiceIssue> findAllByOrderByCreatedAtDesc();

    long countByStatus(
            IssueStatus status
    );

    long countByPriority(
            IssuePriority priority
    );

    long countByCategory(
            IssueCategory category
    );

    @Query(
            value = """
                    SELECT AVG(
                        EXTRACT(
                            EPOCH FROM (
                                resolved_at - created_at
                            )
                        ) / 3600.0
                    )
                    FROM service_issues
                    WHERE resolved_at IS NOT NULL
                    """,
            nativeQuery = true
    )
    Double findAverageResolutionHours();
    @Query(
        value = """
                SELECT
                    TO_CHAR(created_at, 'Mon') AS month,
                    COUNT(*) AS count
                FROM service_issues
                GROUP BY
                    DATE_TRUNC('month', created_at),
                    TO_CHAR(created_at, 'Mon')
                ORDER BY
                    DATE_TRUNC('month', created_at)
                """,
        nativeQuery = true
)
List<Object[]> findMonthlyTrend();
}