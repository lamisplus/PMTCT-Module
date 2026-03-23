package org.lamisplus.modules.pmtct.service;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

import org.springframework.context.annotation.Primary;

import java.util.Optional;


@Service
@RequiredArgsConstructor
@Primary
public class CurrentUserOrganizationService {
    private  final UserService userService;

    public Long getCurrentUserOrganization() {
        Optional<User> userWithRoles = userService.getUserWithRoles ();
        return userWithRoles.map (User::getCurrentOrganisationUnitId).orElse (null);
    }
}
