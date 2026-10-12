package com.smartfamily.financial.service;

import com.smartfamily.financial.dto.UserDto;
import com.smartfamily.financial.entity.User;
import com.smartfamily.financial.exception.BadRequestException;
import com.smartfamily.financial.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, AuthService authService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto getCurrentUserProfile() {
        User user = authService.getCurrentAuthenticatedUser();
        return toDto(user);
    }

    @Transactional
    public UserDto updateProfile(UserDto updateDto) {
        User user = authService.getCurrentAuthenticatedUser();
        if (updateDto.getFullName() != null && !updateDto.getFullName().trim().isEmpty()) {
            user.setFullName(updateDto.getFullName().trim());
        }
        if (updateDto.getPhone() != null) {
            user.setPhone(updateDto.getPhone().trim());
        }
        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public void changePassword(String oldPassword, String newPassword) {
        User user = authService.getCurrentAuthenticatedUser();
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getCreatedAt());
    }
}
