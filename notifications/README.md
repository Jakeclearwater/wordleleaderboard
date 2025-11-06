# Custom Notifications

This folder contains custom notification JSON files that will be displayed in the Message Center.

## File Format

Each notification should be a JSON file with the following structure:

```json
{
  "id": "unique-identifier",
  "type": "custom",
  "version": "1.20.0",
  "subject": "Notification Subject Line",
  "body": "Full message body with details.\n\nSupports multiple paragraphs.",
  "sender": "Sender Name",
  "date": "2024-11-07T12:00:00Z",
  "badge": "Label Text",
  "link": {
    "url": "https://example.com",
    "text": "Link Text"
  },
  "priority": "normal"
}
```

## Field Descriptions

- **id** (required): Unique identifier for the notification. Should follow format: `custom-YYYY-MM-DD-description`
- **type** (required): Always set to `"custom"` for custom notifications
- **version** (optional): Version number for display purposes
- **subject** (required): Short subject line shown in collapsed view
- **body** (required): Full message content with details
- **sender** (required): Name of the person/system sending the notification
- **date** (required): ISO 8601 timestamp when the notification was created
- **badge** (optional): Label text to display (e.g., "Announcement", "Update", "Alert")
- **link** (optional): Object with `url` and `text` properties for an external link
- **priority** (optional): `"high"`, `"normal"`, or `"low"` (default: "normal")

## Usage

1. Create a new JSON file in this folder with a descriptive name (e.g., `maintenance-2024-11-07.json`)
2. Fill in all required fields
3. The notification will automatically appear in the Message Center
4. Users can dismiss notifications individually

## Examples

See `example-notification.json` for a complete example.
