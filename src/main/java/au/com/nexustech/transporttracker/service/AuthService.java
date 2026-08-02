package au.com.nexustech.transporttracker.service;

import au.com.nexustech.transporttracker.dto.auth.AuthResponse;
import au.com.nexustech.transporttracker.dto.auth.LoginRequest;
import au.com.nexustech.transporttracker.dto.auth.RegisterRequest;
import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.enums.UserRole;
import au.com.nexustech.transporttracker.repository.AppUserRepository;
import au.com.nexustech.transporttracker.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(
            RegisterRequest request
    ) {
        if (appUserRepository.existsByUsername(
                request.username()
        )) {
            throw new IllegalArgumentException(
                    "Username is already in use"
            );
        }

        if (appUserRepository.existsByEmail(
                request.email()
        )) {
            throw new IllegalArgumentException(
                    "Email is already in use"
            );
        }

        AppUser user = new AppUser(
                request.username().trim(),
                request.fullName().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                UserRole.REPORTER
        );

        AppUser savedUser =
                appUserRepository.save(user);

        return createResponse(savedUser);
    }

    public AuthResponse login(
            LoginRequest request
    ) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        AppUser user = appUserRepository
                .findByUsername(request.username())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Invalid username or password"
                        )
                );

        return createResponse(user);
    }

    private AuthResponse createResponse(
            AppUser user
    ) {
        return new AuthResponse(
                jwtService.generateToken(user),
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}