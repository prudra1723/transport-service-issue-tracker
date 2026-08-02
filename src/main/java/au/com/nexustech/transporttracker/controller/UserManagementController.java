package au.com.nexustech.transporttracker.controller;

import au.com.nexustech.transporttracker.dto.CreateUserRequest;
import au.com.nexustech.transporttracker.dto.ResetPasswordRequest;
import au.com.nexustech.transporttracker.dto.UpdateUserActiveRequest;
import au.com.nexustech.transporttracker.dto.UpdateUserRoleRequest;
import au.com.nexustech.transporttracker.dto.UserResponse;
import au.com.nexustech.transporttracker.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(
            UserManagementService userManagementService
    ) {
        this.userManagementService =
                userManagementService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userManagementService
                .getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(
            @PathVariable Long id
    ) {
        return userManagementService
                .getUserById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(
            @Valid @RequestBody
            CreateUserRequest request
    ) {
        return userManagementService
                .createUser(request);
    }

    @PatchMapping("/{id}/role")
    public UserResponse updateRole(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateUserRoleRequest request
    ) {
        return userManagementService
                .updateRole(id, request);
    }

    @PatchMapping("/{id}/active")
    public UserResponse updateActiveStatus(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateUserActiveRequest request
    ) {
        return userManagementService
                .updateActiveStatus(
                        id,
                        request
                );
    }

    @PatchMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody
            ResetPasswordRequest request
    ) {
        userManagementService
                .resetPassword(
                        id,
                        request
                );
    }
}