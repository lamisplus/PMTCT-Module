package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@RequiredArgsConstructor
public class PatientActivity {
    @NonNull
    private Long id;
    @NonNull
    private String name;
    @NonNull
    private LocalDate date;
    @NonNull
    private String icon;
    @NonNull
    private String path;
    private Boolean deletable = true;
    private Boolean editable = true;
    private Boolean viewable = true;
    private List<String> keywords;
}
