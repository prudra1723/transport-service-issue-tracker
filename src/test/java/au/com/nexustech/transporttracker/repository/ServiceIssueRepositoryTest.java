package au.com.nexustech.transporttracker.repository;

import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import au.com.nexustech.transporttracker.enums.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class ServiceIssueRepositoryTest {

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private ServiceIssueRepository serviceIssueRepository;

    @Test
    void shouldSaveAndFindServiceIssueByIssueNumber() {
        AppUser reporter = new AppUser(
                "rudra",
                "Rudra Pandey",
                "rudra@example.com",
                UserRole.REPORTER
        );

        AppUser savedReporter = appUserRepository.save(reporter);

        ServiceIssue issue = new ServiceIssue(
                "TSI-0001",
                "Passenger information display unavailable",
                "The passenger information display is not working.",
                IssueCategory.APPLICATION,
                IssuePriority.HIGH,
                savedReporter
        );

        ServiceIssue savedIssue = serviceIssueRepository.save(issue);

        Optional<ServiceIssue> result =
                serviceIssueRepository.findByIssueNumber("TSI-0001");

        assertThat(savedIssue.getId()).isNotNull();
        assertThat(result).isPresent();
        assertThat(result.get().getTitle())
                .isEqualTo("Passenger information display unavailable");
        assertThat(result.get().getStatus()).isEqualTo(IssueStatus.OPEN);
        assertThat(result.get().getReportedBy().getUsername())
                .isEqualTo("rudra");
    }
}