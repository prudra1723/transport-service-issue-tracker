package au.com.nexustech.transporttracker.entity;

import au.com.nexustech.transporttracker.enums.IssueStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "issue_id", nullable = false)
    private ServiceIssue issue;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 30)
    private IssueStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private IssueStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "changed_by", nullable = false)
    private AppUser changedBy;

    @Column(name = "change_reason", length = 500)
    private String changeReason;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    public StatusHistory() {
    }

    public StatusHistory(
            ServiceIssue issue,
            IssueStatus previousStatus,
            IssueStatus newStatus,
            AppUser changedBy,
            String changeReason
    ) {
        this.issue = issue;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.changeReason = changeReason;
    }

    @PrePersist
    public void onCreate() {
        if (changedAt == null) {
            changedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public ServiceIssue getIssue() {
        return issue;
    }

    public IssueStatus getPreviousStatus() {
        return previousStatus;
    }

    public IssueStatus getNewStatus() {
        return newStatus;
    }

    public AppUser getChangedBy() {
        return changedBy;
    }

    public String getChangeReason() {
        return changeReason;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }
}