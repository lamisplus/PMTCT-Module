package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;


@Entity
@Table(name = "pmtct_infant_mother_art",  schema = "public")
@Data
@NoArgsConstructor
public class InfantMotherArt implements Serializable, Persistable<Long>
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private LocalDate visitDate;
    private String ancNumber;
    private String  motherArtInitiationTime;
    private Long regimenTypeId;
    private Long regimenId;
    private String  uuid;
    @CreationTimestamp
    private String visitId;

    @Override
    public boolean isNew() {
        return false;
    }
}
