package au.com.nexustech.transporttracker.service;

import au.com.nexustech.transporttracker.dto.AssignIssueRequest;
import au.com.nexustech.transporttracker.dto.CreateServiceIssueRequest;
import au.com.nexustech.transporttracker.dto.StatusHistoryResponse;
import au.com.nexustech.transporttracker.dto.UpdatePriorityRequest;
import au.com.nexustech.transporttracker.dto.UpdateStatusRequest;
import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.entity.StatusHistory;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import au.com.nexustech.transporttracker.enums.UserRole;
import au.com.nexustech.transporttracker.exception.BusinessRuleException;
import au.com.nexustech.transporttracker.exception.ResourceNotFoundException;
import au.com.nexustech.transporttracker.repository.AppUserRepository;
import au.com.nexustech.transporttracker.repository.ServiceIssueRepository;
import au.com.nexustech.transporttracker.repository.StatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ServiceIssueService {

    private final ServiceIssueRepository serviceIssueRepository;
    private final AppUserRepository appUserRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    public ServiceIssueService(
            ServiceIssueRepository serviceIssueRepository,
            AppUserRepository appUserRepository,
            StatusHistoryRepository statusHistoryRepository
    ) {
        this.serviceIssueRepository = serviceIssueRepository;
        this.appUserRepository = appUserRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    public ServiceIssue createIssue(CreateServiceIssueRequest request) {
        AppUser reporter = appUserRepository
                .findById(request.reportedById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reporter not found with ID: "
                                + request.reportedById()
                ));

        String issueNumber = generateIssueNumber();

        ServiceIssue issue = new ServiceIssue(
                issueNumber,
                request.title(),
                request.description(),
                request.category(),
                request.priority(),
                reporter
        );

        return serviceIssueRepository.save(issue);
    }

    @Transactional(readOnly = true)
    public List<ServiceIssue> getAllIssues() {
        return serviceIssueRepository
                .findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public ServiceIssue getIssueById(Long id) {
        return serviceIssueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service issue not found with ID: " + id
                ));
    }

    @Transactional(readOnly = true)
    public ServiceIssue getIssueByNumber(String issueNumber) {
        return serviceIssueRepository
                .findByIssueNumber(issueNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service issue not found: " + issueNumber
                ));
    }

    public ServiceIssue assignIssue(
            String issueNumber,
            AssignIssueRequest request
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        AppUser assignee = appUserRepository
                .findById(request.assignedToId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assigned user not found with ID: "
                                + request.assignedToId()
                ));

        if (assignee.getActive() == null
                || assignee.getActive() != 1) {
            throw new BusinessRuleException(
                    "The selected user is inactive"
            );
        }

        if (assignee.getRole() != UserRole.SUPPORT_AGENT
                && assignee.getRole() != UserRole.MANAGER
                && assignee.getRole() != UserRole.ADMIN) {
            throw new BusinessRuleException(
                    "Issues can only be assigned to support agents, "
                            + "managers or administrators"
            );
        }

        if (issue.getStatus() == IssueStatus.CLOSED) {
            throw new BusinessRuleException(
                    "A closed issue cannot be assigned"
            );
        }

        issue.setAssignedTo(assignee);

        if (issue.getStatus() == IssueStatus.OPEN
                || issue.getStatus() == IssueStatus.REOPENED) {
            issue.setStatus(IssueStatus.ASSIGNED);
        }

        return serviceIssueRepository.save(issue);
    }

    public ServiceIssue updatePriority(
            String issueNumber,
            UpdatePriorityRequest request
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        if (issue.getStatus() == IssueStatus.CLOSED) {
            throw new BusinessRuleException(
                    "The priority of a closed issue cannot be changed"
            );
        }

        issue.setPriority(request.priority());

        return serviceIssueRepository.save(issue);
    }

    public ServiceIssue updateStatus(
            String issueNumber,
            UpdateStatusRequest request
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        AppUser changedBy = appUserRepository
                .findById(request.changedById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: "
                                + request.changedById()
                ));

        IssueStatus previousStatus = issue.getStatus();
        IssueStatus newStatus = request.status();

        if (previousStatus == IssueStatus.CLOSED
                && newStatus != IssueStatus.REOPENED) {
            throw new BusinessRuleException(
                    "A closed issue must be reopened "
                            + "before changing its status"
            );
        }

        if (newStatus == IssueStatus.ASSIGNED
                && issue.getAssignedTo() == null) {
            throw new BusinessRuleException(
                    "An issue must have an assignee "
                            + "before using ASSIGNED status"
            );
        }

        if (previousStatus == newStatus) {
            throw new BusinessRuleException(
                    "The issue already has status " + newStatus
            );
        }

        issue.setStatus(newStatus);

        if (newStatus == IssueStatus.RESOLVED) {
            issue.setResolvedAt(LocalDateTime.now());
        }

        if (newStatus == IssueStatus.CLOSED) {
            issue.setClosedAt(LocalDateTime.now());
        }

        if (newStatus == IssueStatus.REOPENED) {
            issue.setResolvedAt(null);
            issue.setClosedAt(null);
        }

        ServiceIssue savedIssue =
                serviceIssueRepository.save(issue);

        StatusHistory history = new StatusHistory(
                savedIssue,
                previousStatus,
                newStatus,
                changedBy,
                request.reason()
        );

        statusHistoryRepository.save(history);

        return savedIssue;
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getStatusHistory(
            String issueNumber
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        return statusHistoryRepository
                .findByIssueIdOrderByChangedAtDesc(issue.getId())
                .stream()
                .map(StatusHistoryResponse::from)
                .toList();
    }

    private synchronized String generateIssueNumber() {
        long nextNumber = serviceIssueRepository.count() + 1;
        String issueNumber = String.format(
                "TSI-%04d",
                nextNumber
        );

        while (serviceIssueRepository
                .existsByIssueNumber(issueNumber)) {
            nextNumber++;
            issueNumber = String.format(
                    "TSI-%04d",
                    nextNumber
            );
        }

        return issueNumber;
    }
}