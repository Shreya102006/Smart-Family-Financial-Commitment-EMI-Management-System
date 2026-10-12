package com.smartfamily.financial.repository;

import com.smartfamily.financial.entity.Commitment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommitmentRepository extends JpaRepository<Commitment, Long> {

    List<Commitment> findByFamilyId(Long familyId);

    List<Commitment> findByFamilyOwnerId(Long ownerId);

    List<Commitment> findByFamilyMemberId(Long memberId);

    List<Commitment> findByFamilyOwnerIdAndStatus(Long ownerId, String status);

    long countByFamilyOwnerIdAndStatus(Long ownerId, String status);
}
