package au.com.nexustech.transporttracker.repository;

import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ServiceIssueRepository
        extends JpaRepository<ServiceIssue, Long>,
                JpaSpecificationExecutor<ServiceIssue> {

    Optional<ServiceIssue> findByIssueNumber(String issueNumber);

    boolean existsByIssueNumber(String issueNumber);

    List<ServiceIssue> findByStatusOrderByCreatedAtDesc(IssueStatus status);

    List<ServiceIssue> findByPriorityOrderByCreatedAtDesc(IssuePriority priority);

    List<ServiceIssue> findByAssignedToIdOrderByCreatedAtDesc(Long userId);

    List<ServiceIssue> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title,
            String description
    );
}