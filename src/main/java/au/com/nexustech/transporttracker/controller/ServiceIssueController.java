package au.com.nexustech.transporttracker.controller;

import au.com.nexustech.transporttracker.dto.CreateServiceIssueRequest;
import au.com.nexustech.transporttracker.dto.ServiceIssueResponse;
import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.service.ServiceIssueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class ServiceIssueController {

    private final ServiceIssueService serviceIssueService;

    public ServiceIssueController(ServiceIssueService serviceIssueService) {
        this.serviceIssueService = serviceIssueService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceIssueResponse createIssue(
            @Valid @RequestBody CreateServiceIssueRequest request
    ) {
        ServiceIssue issue = serviceIssueService.createIssue(request);
        return ServiceIssueResponse.from(issue);
    }

    @GetMapping
    public List<ServiceIssueResponse> getAllIssues() {
        return serviceIssueService.getAllIssues()
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
}