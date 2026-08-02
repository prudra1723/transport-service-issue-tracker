package au.com.nexustech.transporttracker.service;

import au.com.nexustech.transporttracker.dto.CreateUserRequest;
import au.com.nexustech.transporttracker.dto.ResetPasswordRequest;
import au.com.nexustech.transporttracker.dto.UpdateUserActiveRequest;
import au.com.nexustech.transporttracker.dto.UpdateUserRoleRequest;
import au.com.nexustech.transporttracker.dto.UserResponse;
import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.exception.BusinessRuleException;
import au.com.nexustech.transporttracker.exception.ResourceNotFoundException;
import au.com.nexustech.transporttracker.repository.AppUserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserManagementService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public UserManagementService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return appUserRepository
                .findAll(
                        Sort.by(
                                Sort.Direction.ASC,
                                "username"
                        )
                )
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return UserResponse.from(
                findUser(id)
        );
    }

    public UserResponse createUser(
            CreateUserRequest request
    ) {
        String username =
                request.username().trim();

        String email =
                request.email().trim().toLowerCase();

        if (
                appUserRepository
                        .existsByUsernameIgnoreCase(username)
        ) {
            throw new BusinessRuleException(
                    "Username is already in use"
            );
        }

        if (
                appUserRepository
                        .existsByEmailIgnoreCase(email)
        ) {
            throw new BusinessRuleException(
                    "Email is already in use"
            );
        }

        AppUser user = new AppUser(
                username,
                request.fullName().trim(),
                email,
                passwordEncoder.encode(
                        request.password()
                ),
                request.role()
        );

        return UserResponse.from(
                appUserRepository.save(user)
        );
    }

    public UserResponse updateRole(
            Long id,
            UpdateUserRoleRequest request
    ) {
        AppUser user = findUser(id);

        user.setRole(request.role());

        return UserResponse.from(
                appUserRepository.save(user)
        );
    }

    public UserResponse updateActiveStatus(
            Long id,
            UpdateUserActiveRequest request
    ) {
        AppUser user = findUser(id);

        user.setActive(
                Boolean.TRUE.equals(
                        request.active()
                )
                        ? 1
                        : 0
        );

        return UserResponse.from(
                appUserRepository.save(user)
        );
    }

    public void resetPassword(
            Long id,
            ResetPasswordRequest request
    ) {
        AppUser user = findUser(id);

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        appUserRepository.save(user);
    }

    private AppUser findUser(Long id) {
        return appUserRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "User not found with ID: " + id
                        )
                );
    }
}