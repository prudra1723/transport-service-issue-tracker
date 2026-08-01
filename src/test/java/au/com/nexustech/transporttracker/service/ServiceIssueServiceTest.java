package au.com.nexustech.transporttracker.service;

import au.com.nexustech.transporttracker.dto.AssignIssueRequest;
import au.com.nexustech.transporttracker.dto.CreateServiceIssueRequest;
import au.com.nexustech.transporttracker.dto.UpdatePriorityRequest;
import au.com.nexustech.transporttracker.dto.UpdateStatusRequest;
import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import au.com.nexustech.transporttracker.enums.UserRole;
import au.com.nexustech.transporttracker.exception.ResourceNotFoundException;
import au.com.nexustech.transporttracker.repository.AppUserRepository;
import au.com.nexustech.transporttracker.repository.StatusHistoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import au.com.nexustech.transporttracker.dto.AddCommentRequest;
import au.com.nexustech.transporttracker.enums.CommentType;
import au.com.nexustech.transporttracker.dto.ResolveIssueRequest;
import au.com.nexustech.transporttracker.enums.CommentType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ServiceIssueServiceTest {

    @Autowired
    private ServiceIssueService serviceIssueService;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @Test
    void shouldCreateIssueWithGeneratedIssueNumber() {
        AppUser reporter = appUserRepository.save(new AppUser(
                "service-reporter",
                "Service Reporter",
                "service.reporter@example.com",
                UserRole.REPORTER
        ));

        CreateServiceIssueRequest request =
                new CreateServiceIssueRequest(
                        "Ticket machine unavailable",
                        "The ticket machine at the station "
                                + "is not responding.",
                        IssueCategory.APPLICATION,
                        IssuePriority.HIGH,
                        reporter.getId()
                );

        ServiceIssue result =
                serviceIssueService.createIssue(request);

        assertThat(result.getId()).isNotNull();
        assertThat(result.getIssueNumber()).startsWith("TSI-");
        assertThat(result.getTitle())
                .isEqualTo("Ticket machine unavailable");
        assertThat(result.getStatus())
                .isEqualTo(IssueStatus.OPEN);
        assertThat(result.getReportedBy().getId())
                .isEqualTo(reporter.getId());
    }

    @Test
    void shouldRejectIssueWhenReporterDoesNotExist() {
        CreateServiceIssueRequest request =
                new CreateServiceIssueRequest(
                        "Display issue",
                        "The platform display is unavailable.",
                        IssueCategory.APPLICATION,
                        IssuePriority.MEDIUM,
                        999999L
                );

        assertThatThrownBy(
                () -> serviceIssueService.createIssue(request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Reporter not found");
    }

    @Test
    void shouldAssignIssueToSupportAgent() {
        AppUser reporter = appUserRepository.save(new AppUser(
                "assignment-reporter",
                "Assignment Reporter",
                "assignment.reporter@example.com",
                UserRole.REPORTER
        ));

        AppUser supportAgent = appUserRepository
                .findByUsername("support.agent")
                .orElseThrow();

        CreateServiceIssueRequest request =
                new CreateServiceIssueRequest(
                        "Station display unavailable",
                        "The station display is not responding.",
                        IssueCategory.APPLICATION,
                        IssuePriority.HIGH,
                        reporter.getId()
                );

        ServiceIssue createdIssue =
                serviceIssueService.createIssue(request);

        ServiceIssue assignedIssue =
                serviceIssueService.assignIssue(
                        createdIssue.getIssueNumber(),
                        new AssignIssueRequest(supportAgent.getId())
                );

        assertThat(assignedIssue.getAssignedTo()).isNotNull();
        assertThat(assignedIssue.getAssignedTo().getId())
                .isEqualTo(supportAgent.getId());
        assertThat(assignedIssue.getStatus())
                .isEqualTo(IssueStatus.ASSIGNED);
    }
@Test
void shouldAddAndRetrieveIssueComment() {
    AppUser reporter = appUserRepository.save(new AppUser(
            "comment-reporter",
            "Comment Test Reporter",
            "comment.reporter@example.com",
            UserRole.REPORTER
    ));

    AppUser supportAgent = appUserRepository
            .findByUsername("support.agent")
            .orElseThrow();

    ServiceIssue issue = serviceIssueService.createIssue(
            new CreateServiceIssueRequest(
                    "Ticket machine issue",
                    "The ticket machine is unavailable.",
                    IssueCategory.APPLICATION,
                    IssuePriority.HIGH,
                    reporter.getId()
            )
    );

    var savedComment = serviceIssueService.addComment(
            issue.getIssueNumber(),
            new AddCommentRequest(
                    "Initial investigation has started.",
                    CommentType.COMMENT,
                    supportAgent.getId()
            )
    );

    var comments = serviceIssueService.getComments(
            issue.getIssueNumber()
    );

    assertThat(savedComment.id()).isNotNull();
    assertThat(savedComment.commentText())
            .isEqualTo("Initial investigation has started.");
    assertThat(savedComment.commentType())
            .isEqualTo(CommentType.COMMENT);
    assertThat(savedComment.authorId())
            .isEqualTo(supportAgent.getId());
    assertThat(comments).hasSize(1);
}
    @Test
    void shouldUpdateIssuePriorityStatusAndHistory() {
        AppUser reporter = appUserRepository.save(new AppUser(
                "status-reporter",
                "Status Test Reporter",
                "status.reporter@example.com",
                UserRole.REPORTER
        ));

        AppUser supportAgent = appUserRepository
                .findByUsername("support.agent")
                .orElseThrow();

        ServiceIssue issue = serviceIssueService.createIssue(
                new CreateServiceIssueRequest(
                        "Platform display failure",
                        "The platform display is unavailable.",
                        IssueCategory.APPLICATION,
                        IssuePriority.MEDIUM,
                        reporter.getId()
                )
        );

        serviceIssueService.assignIssue(
                issue.getIssueNumber(),
                new AssignIssueRequest(supportAgent.getId())
        );

        ServiceIssue prioritisedIssue =
                serviceIssueService.updatePriority(
                        issue.getIssueNumber(),
                        new UpdatePriorityRequest(
                                IssuePriority.CRITICAL
                        )
                );

        ServiceIssue inProgressIssue =
                serviceIssueService.updateStatus(
                        issue.getIssueNumber(),
                        new UpdateStatusRequest(
                                IssueStatus.IN_PROGRESS,
                                "Support agent started investigating",
                                supportAgent.getId()
                        )
                );

        assertThat(prioritisedIssue.getPriority())
                .isEqualTo(IssuePriority.CRITICAL);
        assertThat(inProgressIssue.getStatus())
                .isEqualTo(IssueStatus.IN_PROGRESS);

        var history = statusHistoryRepository
                .findByIssueIdOrderByChangedAtDesc(issue.getId());

        assertThat(history).hasSize(1);
        assertThat(history.get(0).getPreviousStatus())
                .isEqualTo(IssueStatus.ASSIGNED);
        assertThat(history.get(0).getNewStatus())
                .isEqualTo(IssueStatus.IN_PROGRESS);
        assertThat(history.get(0).getChangeReason())
                .isEqualTo(
                        "Support agent started investigating"
                );
        assertThat(history.get(0).getChangedBy().getId())
                .isEqualTo(supportAgent.getId());
    }
    @Test
void shouldResolveIssueAndCreateResolutionRecords() {
    AppUser reporter = appUserRepository.save(new AppUser(
            "resolution-reporter",
            "Resolution Test Reporter",
            "resolution.reporter@example.com",
            UserRole.REPORTER
    ));

    AppUser supportAgent = appUserRepository
            .findByUsername("support.agent")
            .orElseThrow();

    ServiceIssue issue = serviceIssueService.createIssue(
            new CreateServiceIssueRequest(
                    "Passenger display failure",
                    "The passenger display is unavailable.",
                    IssueCategory.APPLICATION,
                    IssuePriority.HIGH,
                    reporter.getId()
            )
    );

    serviceIssueService.assignIssue(
            issue.getIssueNumber(),
            new AssignIssueRequest(supportAgent.getId())
    );

    ServiceIssue resolvedIssue =
            serviceIssueService.resolveIssue(
                    issue.getIssueNumber(),
                    new ResolveIssueRequest(
                            "Restarted the display service "
                                    + "and confirmed normal operation.",
                            supportAgent.getId()
                    )
            );

    var history = serviceIssueService.getStatusHistory(
            issue.getIssueNumber()
    );

    var comments = serviceIssueService.getComments(
            issue.getIssueNumber()
    );

    assertThat(resolvedIssue.getStatus())
            .isEqualTo(IssueStatus.RESOLVED);
    assertThat(resolvedIssue.getResolutionNotes())
            .contains("confirmed normal operation");
    assertThat(resolvedIssue.getResolvedAt()).isNotNull();

    assertThat(history).hasSize(1);
    assertThat(history.get(0).previousStatus())
            .isEqualTo(IssueStatus.ASSIGNED);
    assertThat(history.get(0).newStatus())
            .isEqualTo(IssueStatus.RESOLVED);

    assertThat(comments).hasSize(1);
    assertThat(comments.get(0).commentType())
            .isEqualTo(CommentType.RESOLUTION_NOTE);
}
}