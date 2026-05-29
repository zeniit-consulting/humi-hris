# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# Communication
- Use Indonesian language for all UI labels, error messages, and user-facing text. Confidence: 0.95

# UI/UX Design
- Use popup/modal forms for CRUD operations instead of separate pages. Confidence: 0.90
- Use #006069 as the primary color for user portal interfaces. Confidence: 0.85
- Use Geist font family as the global font. Confidence: 0.80
- Implement toast notifications positioned at top-center for success/error messages. Confidence: 0.75

# Maps
- Use Stadia Maps tiles for Leaflet maps with URL pattern: https://stadiamaps.com{z}/{x}/{y}{r}.png. Confidence: 0.80

# Business Logic
- Implement Indonesian PPH21 tax calculation using progressive tax brackets and PTKP values. Confidence: 0.85
- Round down PKP (taxable income) to nearest thousand (floor to 1000). Confidence: 0.80
- Employee ID format: [PositionCode 2-3 chars][Sequence 3 digits][Month 2 digits][Year 2 digits]. Confidence: 0.75

# Frontend
- Use input masking for number/thousand separators in forms. Confidence: 0.80
- Remove attribution text from Leaflet maps in production. Confidence: 0.70
- Implement PWA with offline mode support. Confidence: 0.75

