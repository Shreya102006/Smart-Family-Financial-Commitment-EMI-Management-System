package com.smartfamily.financial.repository;

import com.smartfamily.financial.entity.Family;
import com.smartfamily.financial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyRepository extends JpaRepository<Family, Long> {

    List<Family> findByOwner(User owner);

    List<Family> findByOwnerId(Long ownerId);

    Optional<Family> findFirstByOwnerIdOrderByCreatedAtAsc(Long ownerId);
}
