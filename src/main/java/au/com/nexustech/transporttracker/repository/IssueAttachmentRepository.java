package au.com.nexustech.transporttracker.repository;

import au.com.nexustech.transporttracker.entity.IssueAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueAttachmentRepository
        extends JpaRepository<IssueAttachment, Long> {

    List<IssueAttachment> findByIssueIdOrderByUploadedAtDesc(
            Long issueId
    );
}