package au.com.nexustech.transporttracker.service;

import au.com.nexustech.transporttracker.dto.CreateServiceIssueRequest;
import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.exception.ResourceNotFoundException;
import au.com.nexustech.transporttracker.repository.AppUserRepository;
import au.com.nexustech.transporttracker.repository.ServiceIssueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ServiceIssueService {

    private final ServiceIssueRepository serviceIssueRepository;
    private final AppUserRepository appUserRepository;

    public ServiceIssueService(
            ServiceIssueRepository serviceIssueRepository,
            AppUserRepository appUserRepository
    ) {
        this.serviceIssueRepository = serviceIssueRepository;
        this.appUserRepository = appUserRepository;
    }

    public ServiceIssue createIssue(CreateServiceIssueRequest request) {
        AppUser reporter = appUserRepository.findById(request.reportedById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reporter not found with ID: " + request.reportedById()
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
        return serviceIssueRepository.findAllByOrderByCreatedAtDesc();
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
        return serviceIssueRepository.findByIssueNumber(issueNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service issue not found: " + issueNumber
                ));
    }

    private synchronized String generateIssueNumber() {
        long nextNumber = serviceIssueRepository.count() + 1;
        String issueNumber = String.format("TSI-%04d", nextNumber);

        while (serviceIssueRepository.existsByIssueNumber(issueNumber)) {
            nextNumber++;
            issueNumber = String.format("TSI-%04d", nextNumber);
        }

        return issueNumber;
    }
}