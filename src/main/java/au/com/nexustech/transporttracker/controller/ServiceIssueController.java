package au.com.nexustech.transporttracker.controller;

import au.com.nexustech.transporttracker.dto.AddCommentRequest;
import au.com.nexustech.transporttracker.dto.AssignIssueRequest;
import au.com.nexustech.transporttracker.dto.CreateServiceIssueRequest;
import au.com.nexustech.transporttracker.dto.IssueCommentResponse;
import au.com.nexustech.transporttracker.dto.ResolveIssueRequest;
import au.com.nexustech.transporttracker.dto.ServiceIssueResponse;
import au.com.nexustech.transporttracker.dto.StatusHistoryResponse;
import au.com.nexustech.transporttracker.dto.UpdatePriorityRequest;
import au.com.nexustech.transporttracker.dto.UpdateServiceIssueRequest;
import au.com.nexustech.transporttracker.dto.UpdateStatusRequest;
import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import au.com.nexustech.transporttracker.service.ServiceIssueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class ServiceIssueController {

    private final ServiceIssueService serviceIssueService;

    public ServiceIssueController(
            ServiceIssueService serviceIssueService
    ) {
        this.serviceIssueService = serviceIssueService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceIssueResponse createIssue(
            @Valid @RequestBody CreateServiceIssueRequest request
    ) {
        ServiceIssue issue =
                serviceIssueService.createIssue(request);

        return ServiceIssueResponse.from(issue);
    }

    @GetMapping
    public List<ServiceIssueResponse> searchIssues(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssuePriority priority,
            @RequestParam(required = false) IssueCategory category,
            @RequestParam(required = false) Long assignedToId
    ) {
        return serviceIssueService.searchIssues(
                        keyword,
                        status,
                        priority,
                        category,
                        assignedToId
                )
                .stream()
                .map(ServiceIssueResponse::from)
                .toList();
    }

    @GetMapping("/{issueNumber}")
    public ServiceIssueResponse getIssueByNumber(
            @PathVariable String issueNumber
    ) {
        return ServiceIssueResponse.from(
                serviceIssueService.getIssueByNumber(issueNumber)
        );
    }

    @PutMapping("/{issueNumber}")
    public ServiceIssueResponse updateIssue(
            @PathVariable String issueNumber,
            @Valid @RequestBody UpdateServiceIssueRequest request
    ) {
        return ServiceIssueResponse.from(
                serviceIssueService.updateIssue(
                        issueNumber,
                        request
                )
        );
    }

    @DeleteMapping("/{issueNumber}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteIssue(
            @PathVariable String issueNumber
    ) {
        serviceIssueService.deleteIssue(issueNumber);
    }

    @PatchMapping("/{issueNumber}/assignment")
    public ServiceIssueResponse assignIssue(
            @PathVariable String issueNumber,
            @Valid @RequestBody AssignIssueRequest request
    ) {
        return ServiceIssueResponse.from(
                serviceIssueService.assignIssue(
                        issueNumber,
                        request
                )
        );
    }

    @PatchMapping("/{issueNumber}/priority")
    public ServiceIssueResponse updatePriority(
            @PathVariable String issueNumber,
            @Valid @RequestBody UpdatePriorityRequest request
    ) {
        return ServiceIssueResponse.from(
                serviceIssueService.updatePriority(
                        issueNumber,
                        request
                )
        );
    }

    @PatchMapping("/{issueNumber}/status")
    public ServiceIssueResponse updateStatus(
            @PathVariable String issueNumber,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        return ServiceIssueResponse.from(
                serviceIssueService.updateStatus(
                        issueNumber,
                        request
                )
        );
    }

    @PatchMapping("/{issueNumber}/resolution")
    public ServiceIssueResponse resolveIssue(
            @PathVariable String issueNumber,
            @Valid @RequestBody ResolveIssueRequest request
    ) {
        return ServiceIssueResponse.from(
                serviceIssueService.resolveIssue(
                        issueNumber,
                        request
                )
        );
    }

    @PostMapping("/{issueNumber}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueCommentResponse addComment(
            @PathVariable String issueNumber,
            @Valid @RequestBody AddCommentRequest request
    ) {
        return serviceIssueService.addComment(
                issueNumber,
                request
        );
    }

    @GetMapping("/{issueNumber}/comments")
    public List<IssueCommentResponse> getComments(
            @PathVariable String issueNumber
    ) {
        return serviceIssueService.getComments(issueNumber);
    }

    @GetMapping("/{issueNumber}/history")
    public List<StatusHistoryResponse> getStatusHistory(
            @PathVariable String issueNumber
    ) {
        return serviceIssueService
                .getStatusHistory(issueNumber);
    }
}