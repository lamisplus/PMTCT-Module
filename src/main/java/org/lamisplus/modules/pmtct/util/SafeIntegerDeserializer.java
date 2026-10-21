package org.lamisplus.modules.pmtct.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;

/**
 * Custom JSON deserializer that safely converts both String and Number values to Integer.
 * Handles mobile app data where numeric fields may be sent as strings.
 *
 * Example:
 * - "123" (string) → 123 (integer)
 * - 123 (number) → 123 (integer)
 * - "" (empty string) → null
 * - null → null
 */
public class SafeIntegerDeserializer extends JsonDeserializer<Integer> {

    @Override
    public Integer deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
            throws IOException {
        JsonNode node = jsonParser.getCodec().readTree(jsonParser);

        if (node == null || node.isNull() || node.asText().trim().isEmpty()) {
            return null;
        }

        // If it's already a number, return as integer
        if (node.isNumber()) {
            return node.asInt();
        }

        // If it's a string, try to parse it
        if (node.isTextual()) {
            String text = node.asText().trim();
            if (text.isEmpty()) {
                return null;
            }
            try {
                return Integer.parseInt(text);
            } catch (NumberFormatException e) {
                // Log the error but return null instead of throwing exception
                System.err.println("Warning: Could not parse integer value from: '" + text + "'. Returning null.");
                return null;
            }
        }

        // For any other type, return null
        return null;
    }
}
