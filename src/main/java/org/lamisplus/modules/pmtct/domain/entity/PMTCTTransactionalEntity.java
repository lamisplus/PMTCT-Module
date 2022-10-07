package org.lamisplus.modules.pmtct.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.array.StringArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeStringType;
import com.vladmihalcea.hibernate.type.json.JsonStringType;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import javax.persistence.*;

import lombok.Data;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Persistable;
import org.springframework.format.annotation.DateTimeFormat;

@MappedSuperclass
@TypeDefs({@TypeDef(
        name = "string-array",
        typeClass = StringArrayType.class
), @TypeDef(
        name = "int-array",
        typeClass = IntArrayType.class
), @TypeDef(
        name = "json",
        typeClass = JsonStringType.class
), @TypeDef(
        name = "jsonb",
        typeClass = JsonBinaryType.class
), @TypeDef(
        name = "jsonb-node",
        typeClass = JsonNodeBinaryType.class
), @TypeDef(
        name = "json-node",
        typeClass = JsonNodeStringType.class
)})
@Data
public class PMTCTTransactionalEntity implements Serializable, Persistable<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private String hospitalNumber;
    private String uuid;
    private String ancNo;
    @Column(name = "created_date", updatable = false)
    @CreatedDate
    private LocalDateTime createdDate = LocalDateTime.now();
    @JsonIgnore
    @Column(name = "created_by", updatable = false)
    private String createdBy;
    @Column(name = "last_modified_date")
    @LastModifiedDate
    private LocalDateTime lastModifiedDate = LocalDateTime.now();
    @Column(name = "last_modified_by")
    @JsonIgnore
    private String lastModifiedBy;
    private Long facilityId;

    @Override
    public boolean isNew() {
        return id == null;
    }
}
