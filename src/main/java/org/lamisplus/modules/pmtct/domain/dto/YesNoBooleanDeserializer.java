package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

/**
 * Custom deserializer that handles legacy "Yes"/"No" strings
 * as well as standard true/false boolean values.
 */
public class YesNoBooleanDeserializer extends JsonDeserializer<Boolean> {
    @Override
    public Boolean deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String trimmed = value.trim().toLowerCase();
        if ("yes".equals(trimmed) || "true".equals(trimmed)) {
            return Boolean.TRUE;
        }
        if ("no".equals(trimmed) || "false".equals(trimmed)) {
            return Boolean.FALSE;
        }
        return null;
    }
}
