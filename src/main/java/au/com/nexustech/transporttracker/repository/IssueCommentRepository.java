package au.com.nexustech.transporttracker.repository;

import au.com.nexustech.transporttracker.entity.IssueComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueCommentRepository
        extends JpaRepository<IssueComment, Long> {

    List<IssueComment> findByIssueIdOrderByCreatedAtAsc(Long issueId);
}