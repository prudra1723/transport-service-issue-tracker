package au.com.nexustech.transporttracker.service;

import au.com.nexustech.transporttracker.dto.CreateServiceIssueRequest;
import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import au.com.nexustech.transporttracker.enums.UserRole;
import au.com.nexustech.transporttracker.exception.ResourceNotFoundException;
import au.com.nexustech.transporttracker.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import au.com.nexustech.transporttracker.dto.AssignIssueRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ServiceIssueServiceTest {

    @Autowired
    private ServiceIssueService serviceIssueService;

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void shouldCreateIssueWithGeneratedIssueNumber() {
        AppUser reporter = appUserRepository.save(new AppUser(
                "service-reporter",
                "Service Reporter",
                "service.reporter@example.com",
                UserRole.REPORTER
        ));

        CreateServiceIssueRequest request = new CreateServiceIssueRequest(
                "Ticket machine unavailable",
                "The ticket machine at the station is not responding.",
                IssueCategory.APPLICATION,
                IssuePriority.HIGH,
                reporter.getId()
        );

        ServiceIssue result = serviceIssueService.createIssue(request);

        assertThat(result.getId()).isNotNull();
        assertThat(result.getIssueNumber()).startsWith("TSI-");
        assertThat(result.getTitle()).isEqualTo("Ticket machine unavailable");
        assertThat(result.getStatus()).isEqualTo(IssueStatus.OPEN);
        assertThat(result.getReportedBy().getId()).isEqualTo(reporter.getId());
    }

    @Test
    void shouldRejectIssueWhenReporterDoesNotExist() {
        CreateServiceIssueRequest request = new CreateServiceIssueRequest(
                "Display issue",
                "The platform display is unavailable.",
                IssueCategory.APPLICATION,
                IssuePriority.MEDIUM,
                999999L
        );

        assertThatThrownBy(() -> serviceIssueService.createIssue(request))
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

    CreateServiceIssueRequest createRequest =
            new CreateServiceIssueRequest(
                    "Station display unavailable",
                    "The station display is not responding.",
                    IssueCategory.APPLICATION,
                    IssuePriority.HIGH,
                    reporter.getId()
            );

    ServiceIssue createdIssue =
            serviceIssueService.createIssue(createRequest);

    ServiceIssue assignedIssue = serviceIssueService.assignIssue(
            createdIssue.getIssueNumber(),
            new AssignIssueRequest(supportAgent.getId())
    );

    assertThat(assignedIssue.getAssignedTo()).isNotNull();
    assertThat(assignedIssue.getAssignedTo().getId())
            .isEqualTo(supportAgent.getId());
    assertThat(assignedIssue.getStatus())
            .isEqualTo(IssueStatus.ASSIGNED);
}
}