package com.smartfamily.financial.repository;

import com.smartfamily.financial.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {

    List<FamilyMember> findByFamilyId(Long familyId);

    List<FamilyMember> findByFamilyOwnerId(Long ownerId);
}
