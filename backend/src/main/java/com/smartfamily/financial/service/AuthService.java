package com.smartfamily.financial.service;

import com.smartfamily.financial.dto.AuthRequest;
import com.smartfamily.financial.dto.AuthResponse;
import com.smartfamily.financial.dto.RegisterRequest;
import com.smartfamily.financial.entity.Family;
import com.smartfamily.financial.entity.User;
import com.smartfamily.financial.exception.BadRequestException;
import com.smartfamily.financial.exception.ResourceNotFoundException;
import com.smartfamily.financial.repository.FamilyRepository;
import com.smartfamily.financial.repository.UserRepository;
import com.smartfamily.financial.security.JwtTokenProvider;
import com.smartfamily.financial.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       FamilyRepository familyRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user = userRepository.save(user);

        // Auto-create family for user
        String familyName = (request.getFamilyName() != null && !request.getFamilyName().trim().isEmpty())
                ? request.getFamilyName().trim()
                : user.getFullName() + "'s Family";

        Family family = new Family();
        family.setFamilyName(familyName);
        family.setOwner(user);
        family = familyRepository.save(family);

        String token = tokenProvider.generateTokenFromUsername(user.getEmail());

        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), family.getId(), family.getFamilyName());
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Family family = familyRepository.findFirstByOwnerIdOrderByCreatedAtAsc(user.getId())
                .orElse(null);

        Long familyId = family != null ? family.getId() : null;
        String familyName = family != null ? family.getFamilyName() : null;

        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), familyId, familyName);
    }

    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BadRequestException("No authenticated user found");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));
    }
}
