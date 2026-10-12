package com.smartfamily.financial.controller;

import com.smartfamily.financial.dto.ApiResponse;
import com.smartfamily.financial.dto.UserDto;
import com.smartfamily.financial.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.updateProfile(userDto));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestBody Map<String, String> payload) {
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");
        userService.changePassword(oldPassword, newPassword);
        return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
    }
}
