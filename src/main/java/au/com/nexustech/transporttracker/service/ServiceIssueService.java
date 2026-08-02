package au.com.nexustech.transporttracker.service;

import au.com.nexustech.transporttracker.dto.AddCommentRequest;
import au.com.nexustech.transporttracker.dto.AssignIssueRequest;
import au.com.nexustech.transporttracker.dto.CreateServiceIssueRequest;
import au.com.nexustech.transporttracker.dto.IssueCommentResponse;
import au.com.nexustech.transporttracker.dto.ResolveIssueRequest;
import au.com.nexustech.transporttracker.dto.StatusHistoryResponse;
import au.com.nexustech.transporttracker.dto.UpdatePriorityRequest;
import au.com.nexustech.transporttracker.dto.UpdateServiceIssueRequest;
import au.com.nexustech.transporttracker.dto.UpdateStatusRequest;
import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.entity.IssueComment;
import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.entity.StatusHistory;
import au.com.nexustech.transporttracker.enums.CommentType;
import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import au.com.nexustech.transporttracker.enums.UserRole;
import au.com.nexustech.transporttracker.exception.BusinessRuleException;
import au.com.nexustech.transporttracker.exception.ResourceNotFoundException;
import au.com.nexustech.transporttracker.repository.AppUserRepository;
import au.com.nexustech.transporttracker.repository.IssueCommentRepository;
import au.com.nexustech.transporttracker.repository.ServiceIssueRepository;
import au.com.nexustech.transporttracker.repository.StatusHistoryRepository;
import au.com.nexustech.transporttracker.specification.ServiceIssueSpecification;
import org.springframework.data.domain.Sort;
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
    private final IssueCommentRepository issueCommentRepository;

    public ServiceIssueService(
            ServiceIssueRepository serviceIssueRepository,
            AppUserRepository appUserRepository,
            StatusHistoryRepository statusHistoryRepository,
            IssueCommentRepository issueCommentRepository
    ) {
        this.serviceIssueRepository = serviceIssueRepository;
        this.appUserRepository = appUserRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.issueCommentRepository = issueCommentRepository;
    }

    public ServiceIssue createIssue(
            CreateServiceIssueRequest request
    ) {
        AppUser reporter = appUserRepository
                .findById(request.reportedById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reporter not found with ID: "
                                + request.reportedById()
                ));

        String issueNumber = generateIssueNumber();

        ServiceIssue issue = new ServiceIssue(
                issueNumber,
                request.title().trim(),
                request.description().trim(),
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
    public List<ServiceIssue> searchIssues(
            String keyword,
            IssueStatus status,
            IssuePriority priority,
            IssueCategory category,
            Long assignedToId
    ) {
        return serviceIssueRepository.findAll(
                ServiceIssueSpecification.withFilters(
                        keyword,
                        status,
                        priority,
                        category,
                        assignedToId
                ),
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );
    }

    @Transactional(readOnly = true)
    public ServiceIssue getIssueById(Long id) {
        return serviceIssueRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service issue not found with ID: " + id
                ));
    }

    @Transactional(readOnly = true)
    public ServiceIssue getIssueByNumber(
            String issueNumber
    ) {
        return serviceIssueRepository
                .findByIssueNumber(issueNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service issue not found: " + issueNumber
                ));
    }

    public ServiceIssue updateIssue(
            String issueNumber,
            UpdateServiceIssueRequest request
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        if (issue.getStatus() == IssueStatus.CLOSED) {
            throw new BusinessRuleException(
                    "A closed issue cannot be edited"
            );
        }

        issue.setTitle(request.title().trim());
        issue.setDescription(request.description().trim());
        issue.setCategory(request.category());
        issue.setPriority(request.priority());

        return serviceIssueRepository.save(issue);
    }

    public void deleteIssue(
            String issueNumber
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        serviceIssueRepository.delete(issue);
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

        if (!canManageIssues(assignee)) {
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

        if (changedBy.getActive() == null
                || changedBy.getActive() != 1) {
            throw new BusinessRuleException(
                    "An inactive user cannot change issue status"
            );
        }

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
            issue.setClosedAt(null);
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

        statusHistoryRepository.save(new StatusHistory(
                savedIssue,
                previousStatus,
                newStatus,
                changedBy,
                request.reason()
        ));

        return savedIssue;
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getStatusHistory(
            String issueNumber
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        return statusHistoryRepository
                .findByIssueIdOrderByChangedAtDesc(
                        issue.getId()
                )
                .stream()
                .map(StatusHistoryResponse::from)
                .toList();
    }

    public IssueCommentResponse addComment(
            String issueNumber,
            AddCommentRequest request
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        AppUser author = appUserRepository
                .findById(request.authorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Comment author not found with ID: "
                                + request.authorId()
                ));

        if (author.getActive() == null
                || author.getActive() != 1) {
            throw new BusinessRuleException(
                    "An inactive user cannot add comments"
            );
        }

        IssueComment comment = new IssueComment(
                issue,
                author,
                request.commentText().trim(),
                request.commentType()
        );

        return IssueCommentResponse.from(
                issueCommentRepository.save(comment)
        );
    }

    @Transactional(readOnly = true)
    public List<IssueCommentResponse> getComments(
            String issueNumber
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        return issueCommentRepository
                .findByIssueIdOrderByCreatedAtAsc(
                        issue.getId()
                )
                .stream()
                .map(IssueCommentResponse::from)
                .toList();
    }

    public ServiceIssue resolveIssue(
            String issueNumber,
            ResolveIssueRequest request
    ) {
        ServiceIssue issue = getIssueByNumber(issueNumber);

        AppUser resolvedBy = appUserRepository
                .findById(request.resolvedById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resolving user not found with ID: "
                                + request.resolvedById()
                ));

        if (resolvedBy.getActive() == null
                || resolvedBy.getActive() != 1) {
            throw new BusinessRuleException(
                    "An inactive user cannot resolve an issue"
            );
        }

        if (!canManageIssues(resolvedBy)) {
            throw new BusinessRuleException(
                    "Only support agents, managers or administrators "
                            + "can resolve issues"
            );
        }

        if (issue.getStatus() == IssueStatus.CLOSED) {
            throw new BusinessRuleException(
                    "A closed issue cannot be resolved"
            );
        }

        if (issue.getStatus() == IssueStatus.RESOLVED) {
            throw new BusinessRuleException(
                    "The issue is already resolved"
            );
        }

        IssueStatus previousStatus = issue.getStatus();

        issue.setResolutionNotes(
                request.resolutionNotes().trim()
        );
        issue.setStatus(IssueStatus.RESOLVED);
        issue.setResolvedAt(LocalDateTime.now());
        issue.setClosedAt(null);

        ServiceIssue savedIssue =
                serviceIssueRepository.save(issue);

        statusHistoryRepository.save(new StatusHistory(
                savedIssue,
                previousStatus,
                IssueStatus.RESOLVED,
                resolvedBy,
                "Issue resolved"
        ));

        issueCommentRepository.save(new IssueComment(
                savedIssue,
                resolvedBy,
                request.resolutionNotes().trim(),
                CommentType.RESOLUTION_NOTE
        ));

        return savedIssue;
    }

    private boolean canManageIssues(
            AppUser user
    ) {
        return user.getRole() == UserRole.SUPPORT_AGENT
                || user.getRole() == UserRole.MANAGER
                || user.getRole() == UserRole.ADMIN;
    }

    private synchronized String generateIssueNumber() {
        long nextNumber =
                serviceIssueRepository.count() + 1;

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