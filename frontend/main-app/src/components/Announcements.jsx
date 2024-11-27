import React from 'react';
import Comments from './Comments';

const Announcements = ({ announcements }) => {
  if (!announcements.length) {
    return <p>No announcements available.</p>;
  }

  return (
    <div>
      <h2>Announcements</h2>
      {announcements.map((announcement) => (
        <div key={announcement.id} style={{ marginBottom: '16px' }}>
          <p><strong>Description:</strong> {announcement.description}</p>
          <p><strong>Created At:</strong> {new Date(announcement.created_at).toLocaleString()}</p>
          {announcement.is_edited && <p>(Edited)</p>}
          {announcement.attachments.map((attachment, index) => (
            <a key={index} href={attachment.file_url} target="_blank" rel="noopener noreferrer">
              {attachment.file_name || 'View Attachment'}
            </a>
          ))}
          <Comments itemType="announcement" itemId={announcement.id} />
        </div>
      ))}
    </div>
  );
};

export default Announcements;
