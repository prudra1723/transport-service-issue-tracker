package au.com.nexustech.transporttracker.repository;

import au.com.nexustech.transporttracker.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository
        extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByIssueIdOrderByChangedAtDesc(Long issueId);
}