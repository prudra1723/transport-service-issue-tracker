package au.com.nexustech.transporttracker.entity;

import au.com.nexustech.transporttracker.enums.CommentType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "issue_comments")
public class IssueComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "issue_id", nullable = false)
    private ServiceIssue issue;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private AppUser author;

    @Lob
    @Column(name = "comment_text", nullable = false)
    private String commentText;

    @Enumerated(EnumType.STRING)
    @Column(name = "comment_type", nullable = false, length = 30)
    private CommentType commentType = CommentType.COMMENT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public IssueComment() {
    }

    public IssueComment(
            ServiceIssue issue,
            AppUser author,
            String commentText,
            CommentType commentType
    ) {
        this.issue = issue;
        this.author = author;
        this.commentText = commentText;
        this.commentType = commentType;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;

        if (commentType == null) {
            commentType = CommentType.COMMENT;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public ServiceIssue getIssue() {
        return issue;
    }

    public AppUser getAuthor() {
        return author;
    }

    public String getCommentText() {
        return commentText;
    }

    public CommentType getCommentType() {
        return commentType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}